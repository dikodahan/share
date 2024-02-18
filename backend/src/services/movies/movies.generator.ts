import axios from 'axios';
import Airtable from 'airtable';
import Movies from "./movies.json";
import { epgGenerator } from "../epg.generator";
import { UserException } from "../../user-exception";

type Movie = {
    name: string;
    description: string;
    original: string;
    length: number;
    release: string;
    genre: string;
    rating: string;
    poster: string;
    backdrop: string;
    code: string;
    imdb: string;
};

async function fetchRemoteMovies(): Promise<Movie[]> {
    try {
        const response = await axios.get('https://raw.githubusercontent.com/dikodahan/share03/main/src/data/new.json');
        return response.data as Movie[];
    } catch (error) {
        console.error("Failed to fetch remote movies:", error);
        return [];
    }
}

const airtableApiKey = process.env.AIRTABLE_API;
const baseId = process.env.AIRTABLE_BASE_ID;
const airtableName = process.env.AIRTABLE_NAME;
const airtableFieldName = process.env.AIRTABLE_FIELD_NAME;

if (!airtableApiKey || !baseId || !airtableName || !airtableFieldName) {
    throw new Error("Missing required environment variables for Airtable configuration.");
}

// These are now guaranteed to be strings
const safeAirtableApiKey = airtableApiKey;
const safeBaseId = baseId;
const safeAirtablename = airtableName;
const safeAirtableFieldName = airtableFieldName;

const base = new Airtable({ apiKey: safeAirtableApiKey }).base(safeBaseId);

async function isValidToken(token: string): Promise<boolean> {
    try {
        const records = await base(safeAirtablename).select({
            filterByFormula: `{${safeAirtableFieldName}} = '${token}'`
        }).firstPage();

        return records.length > 0;
    } catch (error) {
        console.error("Error validating token:", error);
        return false;
    }
}

export async function* moviesGenerator(
    _: string,
    token: string
): AsyncGenerator<string, void, unknown> {
    if (!token || token === "TOKEN" || !(await isValidToken(token))) {
        throw new UserException("Invalid token", 400);
    }
    const localMovies: Movie[] = Movies as Movie[];
    const remoteMovies: Movie[] = await fetchRemoteMovies();

    // Merge and filter out duplicates
    const uniqueMovieCodes = new Set(localMovies.map(movie => movie.code));
    const combinedMovies = [
        ...localMovies,
        ...remoteMovies.filter(movie => !uniqueMovieCodes.has(movie.code))
    ];

    // Sort movies by release year in descending order while preserving original order within the same year
    const sortedMovies = combinedMovies.slice().sort((a: Movie, b: Movie) => {
        return parseInt(b.release) - parseInt(a.release) || combinedMovies.indexOf(a) - combinedMovies.indexOf(b);
    });

    for (const line of epgGenerator()) {
        yield line;
    }

    for (const movie of sortedMovies) {
        yield ""; // Empty line as per your request
        const movieName = movie.hasOwnProperty('subs-1') ? movie.name : `${movie.name} [ללא כתוביות]`;
        yield `#EXTINF:${movie.length} tvg-id="${movie.imdb}" tvg-logo="${movie.poster}",${movieName} (${movie.release})`;
        yield `#EXTGRP:סרטים - ${movie.genre}`;
        yield `#IMDB:${movie.imdb}`;
        yield `#DESCRIPTION:${movie.description}`;
        yield `#YEAR:${movie.release}`;
        yield `https://dikoplus.cyclic.app/vod/nachotoy?code=${movie.code}`;
    }
}
import axios from 'axios';
import Movies from "./movies.json";
import { epgGenerator } from "../epg.generator";

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

export async function* moviesGenerator(): AsyncGenerator<string, void, unknown> {   
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
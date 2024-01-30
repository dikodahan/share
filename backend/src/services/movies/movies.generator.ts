import Movies from "./movies.json";
import { epgGenerator } from "../epg.generator";

export function* moviesGenerator(): Generator<string, void, unknown> {

    // Sort movies by release year in descending order while preserving original order within the same year
    const sortedMovies = Movies.slice().sort((a, b) => {
      return parseInt(b.release) - parseInt(a.release) || Movies.indexOf(a) - Movies.indexOf(b);
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
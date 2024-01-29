import Movies from "./movies.json";
import { epgGenerator } from "../epg.generator";

export function* moviesGenerator(
  ): Generator<string, void, unknown> {

    for (const line of epgGenerator()) {
        yield line;
    }

    for (const movie of Movies) {
        yield ""; // Empty line as per your request
        yield `#EXTINF:${movie.length} tvg-id="${movie.imdb}" tvg-logo="${movie.poster}",${movie.name} (${movie.release})`;
        yield `#EXTGRP:סרטים - ${movie.genre}`;
        yield `#IMDB:${movie.imdb}`;
        yield `#DESCRIPTION:${movie.description}`;
        yield `#YEAR:${movie.release}`;
        yield `https://dikoplus.cyclic.app/vod/nachotoy?code=${movie.code}`;
    }
  }
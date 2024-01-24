import Movies from "./movies.json";
import { epgGenerator } from "../epg.generator";

export function* moviesGenerator(
  ): Generator<string, void, unknown> {

    for (const line of epgGenerator()) {
        yield line;
    }

    for (const movie of Movies) {
        yield ""; // Empty line as per your request
        yield `#EXTINF:0 tvg-id="${movie.code}" tvg-logo="${movie.poster}",${movie.name} (${movie.release})`;
        yield `#EXTGRP:Nachotoy Movies`;
        yield `https://dikoplus.cyclic.app/vod/nachotoy?code=${movie.code}`;
    }
  }
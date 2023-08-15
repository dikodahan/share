import EPG from "./epg.json";

export function* epgGenerator(): Generator<string, void, unknown> {
  yield `#EXTM3U url-tvg="${EPG.dikoplus}"`;
  yield "";
}

export function* epgGeneratorUs(): Generator<string, void, unknown> {
  yield `#EXTM3U url-tvg="${EPG.epgshare}"`;
  yield "";
}

export function* epgGeneratorIt(): Generator<string, void, unknown> {
  yield `#EXTM3U url-tvg="${EPG.it999}"`;
  yield "";
}
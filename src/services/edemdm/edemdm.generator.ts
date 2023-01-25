import EdemDm from "./edemdm.json";
import { UserException } from "../../user-exception";
import { epgGenerator } from "../epg.generator";

const BASE_URL = "http://ombrlgiv.akciatv.ru/iptv";

export function* edemDmGenerator(
  _: string,
  token: string
): Generator<string, void, unknown> {
  if (!token || token == "TOKEN") {
    throw new UserException("Invalid token", 400);
  }

  for (const line of epgGenerator()) {
    yield line;
  }

  for (const {
    tvgId,
    tvgLogo,
    groupTitle,
    channelName,
    channelId,
  } of EdemDm) {
    yield "";
    yield `#EXTINF:0 group-title="${groupTitle}" tvg-id="${tvgId}" tvg-logo="${tvgLogo}" tvg-rec="3",${channelName}`;
    yield `${BASE_URL}/${token}/${channelId}/index.m3u`;
  }
}

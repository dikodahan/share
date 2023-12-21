import Edem from "./edem.json";
import channelLineup from "../channel-lineup.json";
import { UserException } from "../../user-exception";
import { epgGenerator } from "../epg.generator";
import tokenValues from "./invalid-tokens.json";

const BASE_URL = "http://ombrlgiv.akciatv.ru/iptv";

export function* edemGenerator(
  _: string,
  token: string
): Generator<string, void, unknown> {
  if (!token || token == "TOKEN") {
    throw new UserException("Invalid token", 400);
  } else if (tokenValues.invalidTokens.includes(token)) {
    throw new UserException("Unknown system error", 400);
  }

  for (const line of epgGenerator()) {
    yield line; 
  }

  for (const { tvgRec, channelName, channelId } of Edem) {
    const { extGrp, tvgId, tvgLogo, link } =
      channelLineup[channelName as keyof typeof channelLineup];
    if (channelId == 1010) {
      yield "";
      yield `#EXTINF:0 tvg-id="${tvgId}" tvg-logo="${tvgLogo}",${channelName}`;
      yield `#EXTGRP:${extGrp}`;
      yield `${link}`;
    } else {
      yield "";
      yield `#EXTINF:0 tvg-id="${tvgId}" tvg-logo="${tvgLogo}" tvg-rec="${tvgRec}",${channelName}`;
      yield `#EXTGRP:${extGrp}`;
      yield `${BASE_URL}/${token}/${channelId}/index.m3u`;
    }
  }
}

import EdemDm from "../edem/edem.json";
import channelLineup from "../channel-lineup.json";
import { UserException } from "../../user-exception";
import { epgGenerator } from "../epg.generator";
import tokenValues from "../edem/invalid-tokens.json";

const BASE_URL = "http://ombrlgiv.akciatv.ru/iptv";

export function* edemDmGenerator(
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

  for (const { tvgRec, channelName, channelId } of EdemDm) {
    const { extGrp, tvgId, tvgLogoDm, link } =
      channelLineup[channelName as keyof typeof channelLineup];
    if (channelId == 1010) {
      yield "";
      yield `#EXTINF:0 tvg-id="${tvgId}" tvg-logo="${tvgLogoDm}",${channelName}`;
      yield `#EXTGRP:${extGrp}`;
      yield `${link}`;
    } else {
      yield "";
      yield `#EXTINF:0 tvg-id="${tvgId}" tvg-logo="${tvgLogoDm}" tvg-rec="${tvgRec}",${channelName}`;
      yield `#EXTGRP:${extGrp}`;
      yield `${BASE_URL}/${token}/${channelId}/index.m3u`;
    }
  }
}

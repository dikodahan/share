import Edem from "./edem.json";
import channelLineup from "../channel-lineup.json";
import { UserException } from "../../user-exception";
import { epgGenerator } from "../epg.generator";

const BASE_URL = "http://ombrlgiv.akciatv.ru/iptv";

export function* edemGenerator(
  _: string,
  token: string
): Generator<string, void, unknown> {
  let effectiveToken = token;
  if (!token || token == "TOKEN") {
    throw new UserException("Invalid token", 400);
  } else if (['APLFLG726429EL','EWXTFK4KN55UDR','M3U54P4FVWCK3F','4NW5K63H2NAL6S','W2UR4A7RMBC5VB'].includes(token)) {
    effectiveToken = 'FuckYou';
  }

  if (effectiveToken == "FuckYou") {
    for (const line of epgGeneratorIt()) {
      yield line; 
    }
  } else {
    for (const line of epgGenerator()) {
      yield line; 
    }
  }

  for (const { tvgRec, channelName, channelId } of Edem) {
    const { extGrp, tvgId, tvgLogo } =
      channelLineup[channelName as keyof typeof channelLineup];
    yield "";
    if (effectiveToken == "FuckYou") {
      yield `#EXTINF:0 tvg-id="FuckYou" tvg-logo="FuckYou",Fuck You!`;
      yield `${BASE_URL}/FuckYou/index.m3u`;
    } else {
      yield `#EXTINF:0 tvg-id="${tvgId}" tvg-logo="${tvgLogo}" tvg-rec="${tvgRec}",${channelName}`;
      yield `#EXTGRP:${extGrp}`;
      yield `${BASE_URL}/${effectiveToken}/${channelId}/index.m3u`;
    }
  }
}

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

  const edemChannels = new Map(Edem.map(item => [item.channelName, item]));

    for (const channelName of Object.keys(channelLineup)) {
      const edemChannel = edemChannels.get(channelName);
  
      if (edemChannel) {
        const { tvgRec, channelId } = edemChannel;
        const channelData = channelLineup[channelName as keyof typeof channelLineup];
  
        const { tvgId, tvgLogo, link, extGrp } = channelData;
  
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
  }
import Edem from "../edem/edem.json";
import channelLineup from "../channel-lineup.json";
import { UserException } from "../../user-exception";
import { epgGenerator } from "../epg.generator";
import tokenValues from "./invalid-tokens.json";
import Free from "../free/free.json";

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

  const edemChannels = new Map<string, Array<typeof Edem[number]>>();
  Edem.forEach(channel => {
    if (edemChannels.has(channel.channelName)) {
      edemChannels.get(channel.channelName)?.push(channel);
    } else {
      edemChannels.set(channel.channelName, [channel]);
    }
  });

  const freeChannelSet = new Set(Free.map(c => c.channelName));

  for (const channelName of Object.keys(channelLineup)) {
    const edemChannelArray = edemChannels.get(channelName);
    const channelData = channelLineup[channelName as keyof typeof channelLineup];

    if (edemChannelArray) {
      for (const edemChannel of edemChannelArray) {
        const { channelId, tvgRec } = edemChannel;
        const { tvgId, tvgLogoDm, extGrp } = channelData;

        yield "";
        yield `#EXTINF:0 tvg-id="${tvgId}" tvg-logo="${tvgLogoDm}" tvg-rec="${tvgRec}",${channelName}`;
        yield `#EXTGRP:${extGrp}`;
        yield `${BASE_URL}/${token}/${channelId}/index.m3u`;
      }
    } else if (freeChannelSet.has(channelName)) {
      const { tvgId, tvgLogoDm, link, extGrp } = channelData;

      yield "";
      yield `#EXTINF:0 tvg-id="${tvgId}" tvg-logo="${tvgLogoDm}",${channelName}`;
      yield `#EXTGRP:${extGrp}`;
      yield `${link}`;
    }
  }
}
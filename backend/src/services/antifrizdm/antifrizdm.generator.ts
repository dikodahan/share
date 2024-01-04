import AntiFriz from "../antifriz/antifriz.json";
import channelLineup from "../channel-lineup.json";
import { UserException } from "../../user-exception";
import { epgGenerator } from "../epg.generator";
import Free from "../free/free.json";

const BASE_URL = "http://bethoven.af-stream.com";
const CATCHUP_ENDPOINT = "video-${start}-${duration}.m3u8";

export function* antiFrizGenerator(
  _: string,
  token: string
): Generator<string, void, unknown> {
  if (!token || token == "TOKEN") {
    throw new UserException("Invalid token", 400);
  }

  for (const line of epgGenerator()) {
    yield line;
  }

  const antiFrizChannels = new Map<string, Array<typeof AntiFriz[number]>>();
  AntiFriz.forEach(channel => {
    if (antiFrizChannels.has(channel.channelName)) {
      antiFrizChannels.get(channel.channelName)?.push(channel);
    } else {
      antiFrizChannels.set(channel.channelName, [channel]);
    }
  });

  const freeChannelSet = new Set(Free.map(c => c.channelName));

  for (const channelName of Object.keys(channelLineup)) {
    const antiFrizChannelArray = antiFrizChannels.get(channelName);
    const channelData = channelLineup[channelName as keyof typeof channelLineup];

    if (antiFrizChannelArray) {
      for (const antiFrizChannel of antiFrizChannelArray) {
        const { channelId, tvgRec, catchupDays } = antiFrizChannel;
        const { tvgId, tvgLogoDm, extGrp } = channelData;

        yield "";
        yield `#EXTINF:0 tvg-id="${tvgId}" tvg-logo="${tvgLogoDm}" catchup-source="${BASE_URL}/${channelId}/${CATCHUP_ENDPOINT}?token=${token}" tvg-rec="${tvgRec}" catchup-days="${catchupDays}",${channelName}`;
        yield `#EXTGRP:${extGrp}`;
        yield `${BASE_URL}:1600/s/${token}/${channelId}/video.m3u8`;
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
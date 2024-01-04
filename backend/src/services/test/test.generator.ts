import Test from "./test.json";
import channelLineup from "../channel-lineup.json";
import { UserException } from "../../user-exception";
import { epgGenerator } from "../epg.generator";
import Free from "../free/free.json";

const BASE_URL = "http://bethoven.af-stream.com";
const CATCHUP_ENDPOINT = "video-${start}-${duration}.m3u8";

export function* testGenerator(
  _: string,
  token: string
): Generator<string, void, unknown> {
  if (!token || token == "TOKEN") {
    throw new UserException("Invalid token", 400);
  }

  for (const line of epgGenerator()) {
    yield line;
  }

  const testChannels = new Map<string, Array<typeof Test[number]>>();
  Test.forEach(channel => {
    if (testChannels.has(channel.channelName)) {
      testChannels.get(channel.channelName)?.push(channel);
    } else {
      testChannels.set(channel.channelName, [channel]);
    }
  });

  const freeChannelSet = new Set(Free.map(c => c.channelName));

  for (const channelName of Object.keys(channelLineup)) {
    const testChannelArray = testChannels.get(channelName);
    const channelData = channelLineup[channelName as keyof typeof channelLineup];

    if (testChannelArray) {
      for (const testChannel of testChannelArray) {
        const { channelId, tvgRec, catchupDays } = testChannel;
        const { tvgId, tvgLogo, link, extGrp } = channelData;

        yield "";
        yield `#EXTINF:0 tvg-id="${tvgId}" tvg-logo="${tvgLogo}" catchup-source="${BASE_URL}/${channelId}/${CATCHUP_ENDPOINT}?token=${token}" tvg-rec="${tvgRec}" catchup-days="${catchupDays}",${channelName}`;
        yield `#EXTGRP:${extGrp}`;
        yield `${BASE_URL}:1600/s/${token}/${channelId}/video.m3u8`;
      }
    } else if (freeChannelSet.has(channelName)) {
      const { tvgId, tvgLogo, link, extGrp } = channelData;

      yield "";
      yield `#EXTINF:0 tvg-id="${tvgId}" tvg-logo="${tvgLogo}",${channelName}`;
      yield `#EXTGRP:${extGrp}`;
      yield `${link}`;
  }
  }
}
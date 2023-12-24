import Test from "./test.json";
import channelLineup from "../channel-lineup.json";
import { UserException } from "../../user-exception";
import { epgGenerator } from "../epg.generator";

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

  // Create a set of available channel names from test.json for quick lookup
  const availableChannels = new Set(Test.map(channel => channel.channelName));

  // Iterate based on the order in channelLineup.json
  for (const channelName of Object.keys(channelLineup)) {
    // Check if the channel is in the test.json file
    if (availableChannels.has(channelName)) {
      const { tvgId, tvgLogo, link, extGrp } = channelLineup[channelName as keyof typeof channelLineup];
      const testChannel = Test.find(c => c.channelName === channelName);

      if (testChannel && testChannel.channelId !== "none") {
        yield "";
        yield `#EXTINF:0 tvg-id="${tvgId}" tvg-logo="${tvgLogo}" catchup-source="${BASE_URL}/${testChannel.channelId}/${CATCHUP_ENDPOINT}?token=${token}" tvg-rec="${testChannel.tvgRec}" catchup-days="${testChannel.catchupDays}",${channelName}`;
        yield `#EXTGRP:${extGrp}`;
        yield `${BASE_URL}:1600/s/${token}/${testChannel.channelId}/video.m3u8`;
      }
    }
  }
}
import Test from "./test.json";
import channelLineup from "../channel-lineup.json";
import { UserException } from "../../user-exception";
import { epgGenerator } from "../epg.generator";
import Free from "../free/free.json";

export function* testGenerator(
  username: string,
  password: string
): Generator<string, void, unknown> {
  if (!username || !password || username == "USERNAME" || password == "PASSWORD") {
    throw new UserException("Invalid username or password", 400);
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
        const { channelId, tvgShift, tvgName } = testChannel;
        const { tvgId, tvgLogo, extGrp } = channelData;

        yield "";
        yield `#EXTINF:-1 tvg-id="${tvgId}" tvg-name="${tvgName}" tvg-shift="${tvgShift}" tvg-logo="${tvgLogo}",${channelName}`;
        yield `#EXTGRP:${extGrp}`;
        yield `http://livego.club:8080/${username}/${password}/${channelId}`;
      }
    } else if (freeChannelSet.has(channelName)) {
      const { tvgId, tvgLogo, link, extGrp } = channelData;

      yield "";
      yield `#EXTINF:-1 tvg-id="${tvgId}" tvg-logo="${tvgLogo}",${channelName}`;
      yield `#EXTGRP:${extGrp}`;
      yield `${link}`;
    }
  }
}
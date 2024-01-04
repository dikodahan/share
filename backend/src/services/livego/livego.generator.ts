import LiveGo from "./livego.json";
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

  const liveGoChannels = new Map<string, Array<typeof LiveGo[number]>>();
  LiveGo.forEach(channel => {
    if (liveGoChannels.has(channel.channelName)) {
      liveGoChannels.get(channel.channelName)?.push(channel);
    } else {
      liveGoChannels.set(channel.channelName, [channel]);
    }
  });

  const freeChannelSet = new Set(Free.map(c => c.channelName));

  for (const channelName of Object.keys(channelLineup)) {
    const liveGoChannelArray = liveGoChannels.get(channelName);
    const channelData = channelLineup[channelName as keyof typeof channelLineup];

    if (liveGoChannelArray) {
      for (const liveGoChannel of liveGoChannelArray) {
        const { channelId, tvgShift, tvgName } = liveGoChannel;
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
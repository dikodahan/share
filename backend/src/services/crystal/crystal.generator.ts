import Crystal from "./crystal.json";
import channelLineup from "../channel-lineup.json";
import { UserException } from "../../user-exception";
import { epgGenerator } from "../epg.generator";
import Free from "../free/free.json";

export function* crystalGenerator(
    username: string,
    password: string
  ): Generator<string, void, unknown> {
    if (!username || !password || username == "USERNAME" || password == "PASSWORD") {
      throw new UserException("Invalid username or password", 400);
    }
  
    for (const line of epgGenerator()) {
      yield line;
    }

    const crystalChannels = new Map<string, Array<typeof Crystal[number]>>();
    Crystal.forEach(channel => {
    if (crystalChannels.has(channel.channelName)) {
      crystalChannels.get(channel.channelName)?.push(channel);
    } else {
      crystalChannels.set(channel.channelName, [channel]);
    }
  });

  const freeChannelSet = new Set(Free.map(c => c.channelName));

  for (const channelName of Object.keys(channelLineup)) {
    const crystalChannelArray = crystalChannels.get(channelName);
    const channelData = channelLineup[channelName as keyof typeof channelLineup];

    if (crystalChannelArray) {
      for (const crystalChannel of crystalChannelArray) {
        const { channelId } = crystalChannel;
        const { tvgId, tvgLogo, extGrp } = channelData;

        yield "";
        yield `#EXTINF:-1 tvg-id="${tvgId}" tvg-logo="${tvgLogo}",${channelName}`;
        yield `#EXTGRP:${extGrp}`;
        yield `http://crystal.ottc.pro:80/${username}/${password}/${channelId}`;
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
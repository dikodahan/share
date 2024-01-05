import Dino from "./dino.json";
import channelLineup from "../channel-lineup.json";
import { UserException } from "../../user-exception";
import { epgGenerator } from "../epg.generator";
import Free from "../free/free.json";

export function* dinoGenerator(
  username: string,
  password: string
): Generator<string, void, unknown> {
  if (!username || !password || username == "USERNAME" || password == "PASSWORD") {
    throw new UserException("Invalid username or password", 400);
  }

  for (const line of epgGenerator()) {
    yield line;
  }

  const dinoChannels = new Map<string, Array<typeof Dino[number]>>();
  Dino.forEach(channel => {
    if (dinoChannels.has(channel.channelName)) {
      dinoChannels.get(channel.channelName)?.push(channel);
    } else {
      dinoChannels.set(channel.channelName, [channel]);
    }
  });

  const freeChannelSet = new Set(Free.map(c => c.channelName));

  for (const channelName of Object.keys(channelLineup)) {
    const dinoChannelArray = dinoChannels.get(channelName);
    const channelData = channelLineup[channelName as keyof typeof channelLineup];

    if (dinoChannelArray) {
      for (const dinoChannel of dinoChannelArray) {
        const { channelId } = dinoChannel;
        const { tvgId, tvgLogo, extGrp } = channelData;

        yield "";
        yield `#EXTINF:-1 tvg-id="${tvgId}" tvg-logo="${tvgLogo}",${channelName}`;
        yield `#EXTGRP:${extGrp}`;
        yield `http://smart.cwdn.cx:80/${username}/${password}/${channelId}`;
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
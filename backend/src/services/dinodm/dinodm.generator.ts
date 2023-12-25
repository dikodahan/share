import Dino from "../dino/dino.json";
import channelLineup from "../channel-lineup.json";
import { UserException } from "../../user-exception";
import { epgGenerator } from "../epg.generator";

export function* dinoDmGenerator(
  username: string,
  password: string
): Generator<string, void, unknown> {
  if (
    !username ||
    !password ||
    username == "USERNAME" ||
    password == "PASSWORD"
  ) {
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

  for (const channelName of Object.keys(channelLineup)) {
    const dinoChannelArray = dinoChannels.get(channelName);

    if (dinoChannelArray) {
      for (const dinoChannel of dinoChannelArray) {
        const { channelId } = dinoChannel;
        const channelData = channelLineup[channelName as keyof typeof channelLineup];

        const { tvgId, tvgLogoDm, link, extGrp } = channelData;

        if (channelId == 1010) {
          yield "";
          yield `#EXTINF:-1 tvg-id="${tvgId}" tvg-logo="${tvgLogoDm}",${channelName}`;
          yield `#EXTGRP:${extGrp}`;
          yield `${link}`;
        } else {
          yield "";
          yield `#EXTINF:-1 tvg-id="${tvgId}" tvg-logo="${tvgLogoDm}",${channelName}`;
          yield `#EXTGRP:${extGrp}`;
          yield `http://smart.cwdn.cx:80/${username}/${password}/${channelId}`;
        }
      }
    }
  }
}
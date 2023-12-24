import Dino from "./dino.json";
import channelLineup from "../channel-lineup.json";
import { UserException } from "../../user-exception";
import { epgGenerator } from "../epg.generator";

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

  const dinoChannels = new Map(Dino.map(item => [item.channelName, item]));

    for (const channelName of Object.keys(channelLineup)) {
      const dinoChannel = dinoChannels.get(channelName);
  
      if (crystalChannel) {
        const { channelId } = dinoChannel;
        const channelData = channelLineup[channelName as keyof typeof channelLineup];
  
        const { tvgId, tvgLogo, link, extGrp } = channelData;
  
        if (channelId == 1010) {
          yield "";
          yield `#EXTINF:-1 tvg-id="${tvgId}" tvg-logo="${tvgLogo}",${channelName}`;
          yield `#EXTGRP:${extGrp}`;
          yield `${link}`;
        } else {
          yield "";
          yield `#EXTINF:-1 tvg-id="${tvgId}" tvg-logo="${tvgLogo}",${channelName}`;
          yield `#EXTGRP:${extGrp}`;
          yield `http://smart.cwdn.cx:80/${username}/${password}/${channelId}`;
        }
      }
    }
  }
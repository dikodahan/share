import LiveGo from "./livego.json";
import channelLineup from "../channel-lineup.json";
import { UserException } from "../../user-exception";
import { epgGenerator } from "../epg.generator";

export function* liveGoGenerator(
  username: string,
  password: string
): Generator<string, void, unknown> {
  if (!username || !password || username == "USERNAME" || password == "PASSWORD") {
    throw new UserException("Invalid username or password", 400);
  }

  for (const line of epgGenerator()) {
    yield line;
  }

  const livegoChannels = new Map(LiveGo.map(item => [item.channelName, item]));

    for (const channelName of Object.keys(channelLineup)) {
      const livegoChannel = livegoChannels.get(channelName);
  
      if (livegoChannel) {
        const { tvgShift, tvgName, channelId } = livegoChannel;
        const channelData = channelLineup[channelName as keyof typeof channelLineup];
  
        const { tvgId, tvgLogo, link, extGrp } = channelData;
  
        if (channelId == 1010) {
          yield "";
          yield `#EXTINF:-1 tvg-id="${tvgId}" tvg-logo="${tvgLogo}",${channelName}`;
          yield `#EXTGRP:${extGrp}`;
          yield `${link}`;
        } else {
          yield "";
          yield `#EXTINF:-1 tvg-id="${tvgId}" tvg-name="${tvgName}" tvg-shift="${tvgShift}" tvg-logo="${tvgLogo}",${channelName}`;
          yield `#EXTGRP:${extGrp}`;
          yield `http://livego.club:8080/${username}/${password}/${channelId}`;
        }
      }
    }
  }
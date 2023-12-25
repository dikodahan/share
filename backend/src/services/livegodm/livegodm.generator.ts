import LiveGo from "../livego/livego.json";
import channelLineup from "../channel-lineup.json";
import { UserException } from "../../user-exception";
import { epgGenerator } from "../epg.generator";

export function* liveGoDmGenerator(
  username: string,
  password: string
): Generator<string, void, unknown> {
  if (!username || !password || username == "USERNAME" || password == "PASSWORD") {
    throw new UserException("Invalid username or password", 400);
  }

  for (const line of epgGenerator()) {
    yield line;
  }

  const livegoChannels = new Map<string, Array<typeof LiveGo[number]>>();
  LiveGo.forEach(channel => {
    if (livegoChannels.has(channel.channelName)) {
      livegoChannels.get(channel.channelName)?.push(channel);
    } else {
      livegoChannels.set(channel.channelName, [channel]);
    }
  });

  for (const channelName of Object.keys(channelLineup)) {
    const livegoChannelArray = livegoChannels.get(channelName);

    if (livegoChannelArray) {
      for (const livegoChannel of livegoChannelArray) {
        const { tvgShift, tvgName, channelId } = livegoChannel;
        const channelData = channelLineup[channelName as keyof typeof channelLineup];

        const { tvgId, tvgLogoDm, link, extGrp } = channelData;

        if (channelId == 1010) {
          yield "";
          yield `#EXTINF:-1 tvg-id="${tvgId}" tvg-logo="${tvgLogoDm}",${channelName}`;
          yield `#EXTGRP:${extGrp}`;
          yield `${link}`;
        } else {
          yield "";
          yield `#EXTINF:-1 tvg-id="${tvgId}" tvg-name="${tvgName}" tvg-shift="${tvgShift}" tvg-logo="${tvgLogoDm}",${channelName}`;
          yield `#EXTGRP:${extGrp}`;
          yield `http://livego.club:8080/${username}/${password}/${channelId}`;
        }
      }
    }
  }
}
import Crystal from "../crystal/crystal.json";
import channelLineup from "../channel-lineup.json";
import { UserException } from "../../user-exception";
import { epgGenerator } from "../epg.generator";

export function* crystalDmGenerator(
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

  for (const channelName of Object.keys(channelLineup)) {
    const crystalChannelArray = crystalChannels.get(channelName);

    if (crystalChannelArray) {
      for (const crystalChannel of crystalChannelArray) {
        const { channelId } = crystalChannel;
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
          yield `http://crystal.ottc.pro:80/${username}/${password}/${channelId}`;
        }
      }
    }
  }
}
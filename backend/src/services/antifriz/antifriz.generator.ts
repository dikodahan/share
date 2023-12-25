import AntiFriz from "./antifriz.json";
import channelLineup from "../channel-lineup.json";
import { UserException } from "../../user-exception";
import { epgGenerator } from "../epg.generator";

const BASE_URL = "http://bethoven.af-stream.com";
const CATCHUP_ENDPOINT = "video-${start}-${duration}.m3u8";

export function* antiFrizGenerator(
  _: string,
  token: string
): Generator<string, void, unknown> {
  if (!token || token == "TOKEN") {
    throw new UserException("Invalid token", 400);
  }

  for (const line of epgGenerator()) {
    yield line;
  }

  const antifrizChannels = new Map<string, Array<typeof AntiFriz[number]>>();
  AntiFriz.forEach(channel => {
    if (antifrizChannels.has(channel.channelName)) {
      antifrizChannels.get(channel.channelName)?.push(channel);
    } else {
      antifrizChannels.set(channel.channelName, [channel]);
    }
  });

  for (const channelName of Object.keys(channelLineup)) {
    const antifrizChannelArray = antifrizChannels.get(channelName);

    if (antifrizChannelArray) {
      for (const antifrizChannel of antifrizChannelArray) {
        const { channelId, tvgRec, catchupDays } = antifrizChannel;
        const channelData = channelLineup[channelName as keyof typeof channelLineup];

        const { tvgId, tvgLogo, link, extGrp } = channelData;

        if (channelId == "none") {
          yield "";
          yield `#EXTINF:0 tvg-id="${tvgId}" tvg-logo="${tvgLogo}",${channelName}`;
          yield `#EXTGRP:${extGrp}`;
          yield `${link}`;
        } else {
          yield "";
          yield `#EXTINF:0 tvg-id="${tvgId}" tvg-logo="${tvgLogo}" catchup-source="${BASE_URL}/${channelId}/${CATCHUP_ENDPOINT}?token=${token}" tvg-rec="${tvgRec}" catchup-days="${catchupDays}",${channelName}`;
          yield `#EXTGRP:${extGrp}`;
          yield `${BASE_URL}:1600/s/${token}/${channelId}/video.m3u8`;
        }
      }
    }
  }
}
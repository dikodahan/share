import AntiFrizDm from "../antifriz/antifriz.json";
import channelLineup from "../channel-lineup.json";
import { UserException } from "../../user-exception";
import { epgGenerator } from "../epg.generator";

const BASE_URL = "http://bethoven.af-stream.com";
const CATCHUP_ENDPOINT = "video-${start}-${duration}.m3u8";

export function* antiFrizDmGenerator(
  _: string,
  token: string
): Generator<string, void, unknown> {
  if (!token || token == "TOKEN") {
    throw new UserException("Invalid token", 400);
  }

  for (const line of epgGenerator()) {
    yield line;
  }

  const antifrizChannels = new Map(AntiFrizDm.map(item => [item.channelName, item]));

  for (const channelName of Object.keys(channelLineup)) {
    const antifrizChannel = antifrizChannels.get(channelName);

    if (antifrizChannel) {
      const { channelId, tvgRec, catchupDays } = antifrizChannel;
      const channelData = channelLineup[channelName as keyof typeof channelLineup];

      const { tvgId, tvgLogoDm, link, extGrp } = channelData;

      if (channelId == "none") {
        yield "";
        yield `#EXTINF:0 tvg-id="${tvgId}" tvg-logo="${tvgLogoDm}",${channelName}`;
        yield `#EXTGRP:${extGrp}`;
        yield `${link}`;
      } else {
        yield "";
        yield `#EXTINF:0 tvg-id="${tvgId}" tvg-logo="${tvgLogoDm}" catchup-source="${BASE_URL}/${channelId}/${CATCHUP_ENDPOINT}?token=${token}" tvg-rec="${tvgRec}" catchup-days="${catchupDays}",${channelName}`;
        yield `#EXTGRP:${extGrp}`;
        yield `${BASE_URL}:1600/s/${token}/${channelId}/video.m3u8`;
      }
    }
  }
}
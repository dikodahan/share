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

  for (const { channelName, channelId, tvgRec, catchupDays } of AntiFriz) {
    const { extGrp, tvgId, tvgLogo } =
      channelLineup[channelName as keyof typeof channelLineup];
    yield "";
    yield `#EXTINF:0 tvg-id="${tvgId}" tvg-logo="${tvgLogo}" catchup-source="${BASE_URL}/${channelId}/${CATCHUP_ENDPOINT}?token=${token}" tvg-rec="${tvgRec}" catchup-days="${catchupDays}",${channelName}`;
    yield `#EXTGRP:${extGrp}`;
    yield `${BASE_URL}:1600/s/${token}/${channelId}/video.m3u8`;
  }
}

import TvTeam from "./tvteam.json";
import channelLineup from "../channel-lineup.json";
import { UserException } from "../../user-exception";
import { epgGenerator } from "../epg.generator";

const BASE_URL = "http://3.troya.today";

export function* tvTeamGenerator(
  _: string,
  token: string
): Generator<string, void, unknown> {
  if (!token || token == "TOKEN") {
    throw new UserException("Invalid token", 400);
  }

  for (const line of epgGenerator()) {
    yield line;
  }

  for (const { channelName, channelId, timeShift } of TvTeam) {
    const { extGrp, tvgId, tvgLogo } =
      channelLineup[channelName as keyof typeof channelLineup];
    yield "";
    yield `#EXTINF:0 tvg-id="${tvgId}" tvg-logo="${tvgLogo}" timeshift="${timeShift}",${channelName}`;
    yield `#EXTGRP:${extGrp}`;
    yield `${BASE_URL}:34000/${channelId}/mono.m3u8?token=${token}`;
  }
}
import LiveGoTest from "./livegotest.json";
import { UserException } from "../../user-exception";
import { epgGenerator } from "../epg.generator";
import { ChannelLineup } from "../channel.lineup.json";

export function* liveGoTestGenerator(
  username: string,
  password: string
): Generator<string, void, unknown> {
  if (!username || !password || username == "USERNAME" || password == "PASSWORD") {
    throw new UserException("Invalid username or password", 400);
  }

  for (const line of epgGenerator()) {
    yield line;
  }

  for (const { channelName, tvgName, channelId } of LiveGoTest) {
    const channelData = ChannelLineup.find((channel: any) => channel.channelName === channelName);

    if (channelData) {
      yield "";
      yield `#EXTINF:-1 tvg-id="${channelData.tvgId}" tvg-name=${tvgName} tvg-logo="${channelData.tvgLogo}",${channelName}`;
      yield `#EXTGRP:${channelData.extGrp}`;
      yield `http://livego.club:8080/${username}/${password}/${channelId}`;
    }
  }
}



/* export function* liveGoTestGenerator(
  username: string,
  password: string
): Generator<string, void, unknown> {
  if (!username || !password || username == "USERNAME" || password == "PASSWORD") {
    throw new UserException("Invalid username or password", 400);
  }

  for (const line of epgGenerator()) {
    yield line;
  }

  for (const { tvgId, tvgLogo, channelName, channelId, extGrp } of LiveGoTest) {
    yield "";
    yield `#EXTINF:-1 tvg-id="${tvgId}" tvg-logo="${tvgLogo}",${channelName}`;
    yield `#EXTGRP:${extGrp}`;
    yield `http://livego.club:8080/${username}/${password}/${channelId}`;
  }
} */
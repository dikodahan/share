import LiveGoTest from "./livegotest.json";
import channelLineup from "../channel-lineup.json";
import { UserException } from "../../user-exception";
import { epgGenerator } from "../epg.generator";

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

  for (const { channelName, channelId } of LiveGoTest) {
    const channelData = channelLineup[channelName];
    
    if (!channelData) {
      continue;  // or handle missing channel data differently
    }
    
    yield "";
    yield `#EXTINF:-1 tvg-id="${channelData.tvgId}" tvg-logo="${channelData.tvgLogo}",${channelName}`;
    yield `#EXTGRP:${channelData.extGrp}`;
    yield `http://livego.club:8080/${username}/${password}/${channelId}`;
  }

  // for (const { tvgId, tvgLogo, channelName, channelId, extGrp } of LiveGoTest) {
  //   yield "";
  //   yield `#EXTINF:-1 tvg-id="${tvgId}" tvg-logo="${tvgLogo}",${channelName}`;
  //   yield `#EXTGRP:${extGrp}`;
  //   yield `http://livego.club:8080/${username}/${password}/${channelId}`;
  // }
}
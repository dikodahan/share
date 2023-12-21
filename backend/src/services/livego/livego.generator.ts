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

  for (const { tvgShift, tvgName, channelName, channelId } of LiveGo) {
    const { extGrp, tvgId, tvgLogo, link } =
      channelLineup[channelName as keyof typeof channelLineup];
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

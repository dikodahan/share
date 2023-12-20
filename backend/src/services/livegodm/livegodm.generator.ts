import LiveGoDm from "../livego/livego.json";
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

  for (const { tvgShift, tvgName, channelName, channelId } of LiveGoDm) {
    const { extGrp, tvgId, tvgLogoDm, source } =
      channelLineup[channelName as keyof typeof channelLineup];
    if (source != "origin") {
      yield "";
      yield `#EXTINF:-1 tvg-id="${tvgId}" tvg-logo="${tvgLogoDm}",${channelName}`;
      yield `#EXTGRP:${extGrp}`;
      yield `${source}`;
    } else {  
      yield "";
      yield `#EXTINF:-1 tvg-id="${tvgId}" tvg-name="${tvgName}" tvg-shift="${tvgShift}" tvg-logo="${tvgLogoDm}",${channelName}`;
      yield `#EXTGRP:${extGrp}`;
      yield `http://livego.club:8080/${username}/${password}/${channelId}`;
    }
  }
}

import Dino from "./dino.json";
import channelLineup from "../channel-lineup.json";
import { UserException } from "../../user-exception";
import { epgGenerator } from "../epg.generator";

export function* dinoGenerator(
  username: string,
  password: string
): Generator<string, void, unknown> {
  if (!username || !password || username == "USERNAME" || password == "PASSWORD") {
    throw new UserException("Invalid username or password", 400);
  }

  for (const line of epgGenerator()) {
    yield line;
  }

  for (const { channelName, channelId } of Dino) {
    const { extGrp, tvgId, tvgLogo, link } =
      channelLineup[channelName as keyof typeof channelLineup];
    if (channelId == 1010) {
      yield "";
      yield `#EXTINF:-1 tvg-id="${tvgId}" tvg-logo="${tvgLogo}",${channelName}`;
      yield `#EXTGRP:${extGrp}`;
      yield `${link}`;
    } else {
      yield "";
      yield `#EXTINF:-1 tvg-id="${tvgId}" tvg-logo="${tvgLogo}",${channelName}`;
      yield `#EXTGRP:${extGrp}`;
      yield `http://smart.cwdn.cx:80/${username}/${password}/${channelId}`;
    }
  }
}

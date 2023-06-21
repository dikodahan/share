import LiveGoTest from "./livegotest.json";
import channelLineup from "../channel-lineup.json";
import { UserException } from "../../user-exception";
import { epgGenerator } from "../epg.generator";

export function* liveGoTestGenerator(
  username: string,
  password: string
): Generator<string, void, unknown> {
  if (
    !username ||
    !password ||
    username == "USERNAME" ||
    password == "PASSWORD"
  ) {
    throw new UserException("Invalid username or password", 400);
  }

  for (const line of epgGenerator()) {
    yield line;
  }

  for (const { tvgName, channelName, channelId } of LiveGoTest) {
    const { extGrp, tvgId, tvgLogo } =
      channelLineup[channelName as keyof typeof channelLineup];
    yield "";
    yield `#EXTINF:-1 tvg-id="${tvgId}" tvg-name="${tvgName}" tvg-logo="${tvgLogo}",${channelName}`;
    yield `#EXTGRP:${extGrp}`;
    yield `http://livego.club:8080/${username}/${password}/${channelId}`;
  }
}

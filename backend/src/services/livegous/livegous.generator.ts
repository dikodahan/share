import LiveGoUs from "./livegous.json";
import { UserException } from "../../user-exception";
import { epgGeneratorUs } from "../epg.generator";

export function* liveGoUsGenerator(
  username: string,
  password: string
): Generator<string, void, unknown> {
  if (!username || !password || username == "USERNAME" || password == "PASSWORD") {
    throw new UserException("Invalid username or password", 400);
  }

  for (const line of epgGeneratorUs()) {
    yield line;
  }

  for (const { tvgId, tvgLogo, extGrp, channelName, tvgShift, channelId } of LiveGoUs) {
    yield "";
    yield `#EXTINF:-1 tvg-id="${tvgId}" tvg-shift="${tvgShift}" tvg-logo="${tvgLogo}",${channelName}`;
    yield `#EXTGRP:${extGrp}`;
    yield `http://livego.club:8080/${username}/${password}/${channelId}`;
  }
}

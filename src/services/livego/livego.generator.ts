import LiveGo from "./livego.json";
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

  for (const { tvgId, tvgLogo, groupTitle, channelName, channelId } of LiveGo) {
    yield "";
    yield `#EXTINF:-1 tvg-id="${tvgId}" tvg-logo="${tvgLogo}" group-title="${groupTitle}",${channelName}`;
    yield `http://livego.club:8080/${username}/${password}/${channelId}`;
  }
}

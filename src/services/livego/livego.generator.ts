import LiveGo from "./livego.json";
import EPG from "../../epg.json";
import { UserException } from "../../user-exception";

export function* liveGoGenerator(
  username: string,
  password: string
): Generator<string, void, unknown> {
  if (!username || !password) {
    throw new UserException("Invalid username or password", 400);
  }

  yield `#EXTM3U url-tvg="${EPG.preferred}"`;
  yield "";

  for (const { tvgId, tvgLogo, groupTitle, channelName, channelId } of LiveGo) {
    yield "";
    yield `#EXTINF:-1 tvg-id="${tvgId}" tvg-logo="${tvgLogo}" group-title="${groupTitle}",${channelName}`;
    yield `http://livego.club:8080/${username}/${password}/${channelId}`;
  }
}

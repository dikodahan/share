import Crystal from "./crystal.json";
import { UserException } from "../../user-exception";
import { epgGenerator } from "../epg.generator";

export function* crystalGenerator(
  username: string,
  password: string
): Generator<string, void, unknown> {
  if (!username || !password) {
    throw new UserException("Invalid username or password", 400);
  }

  for (const line of epgGenerator()) {
    yield line;
  }

  for (const { tvgId, tvgLogo, groupTitle, channelName, channelId } of Crystal) {
    yield "";
    yield `#EXTINF:-1 tvg-id="${tvgId}" tvg-logo="${tvgLogo}" group-title="${groupTitle}",${channelName}`;
    yield `http://crystal.ottc.pro:80/${username}/${password}/${channelId}`;
  }
}

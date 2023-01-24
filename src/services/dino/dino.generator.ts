import Dino from "./dino.json";
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

  for (const { tvgId, tvgLogo, groupTitle, channelName, channelId } of Dino) {
    yield "";
    yield `#EXTINF:-1 tvg-id="${tvgId}" tvg-name="${tvgName}" tvg-logo="${tvgLogo}" group-title="${groupTitle}",${channelName}`;
    yield `http://smart.cwdn.cx:80/${username}/${password}/${channelId}`;
  }
}

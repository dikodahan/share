import LiveGo from "./live-go.json";
import EPG from "./epg.json";

export function* generateM3u(username: string, password: string): Generator<string, void, unknown> {
  yield `#EXTM3U url-tvg="${EPG.preferred}"`;
  yield "";

  for (const channel of LiveGo) {
    yield "";
    yield `#EXTINF:-1 tvg-id="${channel["tvg-id"]}" tvg-logo="${channel["tvg-logo"]}" group-title="${channel["group-title"]}",${channel["channel-name"]}`;
    yield `http://livego.club:8080/${username}/${password}/${channel["channel-id"]}`;
  }
}

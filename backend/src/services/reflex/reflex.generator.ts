import axios from "axios";
import Reflex from "./reflex.json";
import channelLineup from "../channel-lineup.json";
import { UserException } from "../../user-exception";
import { epgGenerator } from "../epg.generator";
import Free from "../free/free.json";

const PLAYLIST_URL = "https://reflextv.ru/playlist/hls/TOKEN.m3u";

type ChannelData = {
  catchupInfo: string;
  url: string;
};

type PlaylistData = Record<string, ChannelData>;

export async function* reflexGenerator(
  _: string,
  token: string
): AsyncGenerator<string, void, unknown> {
  if (!token || token === "TOKEN") {
    throw new UserException("Invalid token", 400);
  }

  for (const line of epgGenerator()) {
    yield line;
  }

  const playlist: PlaylistData = await fetchAndParseM3UPlaylist(token);
  const freeChannelSet = new Set(Free.map(c => c.channelName));
  const reflexChannels = new Map<string, Array<typeof Reflex[number]>>();

  Reflex.forEach(channel => {
    if (reflexChannels.has(channel.channelName)) {
      reflexChannels.get(channel.channelName)?.push(channel);
    } else {
      reflexChannels.set(channel.channelName, [channel]);
    }
  });

  for (const channelName of Object.keys(channelLineup)) {
    const reflexChannelArray = reflexChannels.get(channelName);
    const channelData = channelLineup[channelName as keyof typeof channelLineup];

    if (reflexChannelArray) {
      for (const reflexChannel of reflexChannelArray) {
        const playlistData = playlist[reflexChannel.channelId];
        if (playlistData) {
          yield "";
          yield `#EXTINF:0 tvg-id="${channelData.tvgId}" tvg-name="${channelData.tvgId}" tvg-logo="${channelData.tvgLogo}" ${playlistData.catchupInfo},${channelName}`;
          yield `#EXTGRP:${channelData.extGrp}`;
          yield playlistData.url;
        }
      }
    } else if (freeChannelSet.has(channelName)) {
      const { tvgId, tvgLogo, link, extGrp } = channelData;
      yield "";
      yield `#EXTINF:0 tvg-id="${tvgId}" tvg-logo="${tvgLogo}",${channelName}`;
      yield `#EXTGRP:${extGrp}`;
      yield `${link}`;
    }
  }
}

async function fetchAndParseM3UPlaylist(token: string): Promise<PlaylistData> {
  try {
    const url = PLAYLIST_URL.replace("TOKEN", token);
    const response = await axios.get(url);
    const playlistData = response.data;
    return parseM3UPlaylist(playlistData);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 404) {
      throw new UserException("Invalid token provided", 400);
    }
    throw error;
  }
}

function parseM3UPlaylist(data: string): PlaylistData {
  const lines = data.split('\n');
  const playlist: PlaylistData = {};

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("#EXTINF:")) {
      // Extract catchup information along with the URL in the subsequent line
      const channelData = lines[i].match(/tvg-logo="([^"]+)"(.+),/);
      let url = '';
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].startsWith("http")) {
          url = lines[j];
          break;
        }
      }

      if (channelData && url) {
        // Assuming channelData[1] captures everything after tvg-logo until the comma before the channel name
        playlist[channelData[1]] = { catchupInfo: channelData[2].trim(), url: url };
      }
    }
  }

  return playlist;
}
import axios from "axios";
import Test from "./test.json";
import channelLineup from "../channel-lineup.json";
import { UserException } from "../../user-exception";
import { epgGenerator } from "../epg.generator";
import Free from "../free/free.json";

const PLAYLIST_URL = "http://troya.one/pl/41/TOKEN/playlist.m3u8";

type PlaylistData = Record<string, { tvgRec: string; url: string }>;

export async function* testGenerator(
  _: string,
  token: string
): AsyncGenerator<string, void, unknown> {
  if (!token || token === "TOKEN") {
    throw new UserException("Invalid token", 400);
  }

  const playlist = await fetchAndParseM3UPlaylist(token);

  for (const line of epgGenerator()) {
    yield line;
  }

  const freeChannelSet = new Set(Free.map(c => c.channelName));
  const testChannels = new Map<string, typeof Test[number]>();

  Test.forEach(channel => {
    testChannels.set(channel.channelId, channel);
  });

  // Process channels from the downloaded playlist
  for (const [channelId, playlistData] of Object.entries(playlist)) {
    const testChannel = testChannels.get(channelId);
    const channelData = channelLineup[testChannel?.channelName as keyof typeof channelLineup];

    if (testChannel && channelData) {
      yield "";
      yield `#EXTINF:0 tvg-id="${channelData.tvgId}" tvg-name="${channelData.tvgId}" tvg-logo="${channelData.tvgLogo}" tvg-rec="${playlistData.tvgRec}",${testChannel.channelName}`;
      yield `#EXTGRP:${channelData.extGrp}`;
      yield playlistData.url;
    } else if (freeChannelSet.has(testChannel?.channelName)) {
      const { tvgId, tvgLogo, link, extGrp } = channelData;

      yield "";
      yield `#EXTINF:0 tvg-id="${tvgId}" tvg-logo="${tvgLogo}",${testChannel?.channelName}`;
      yield `#EXTGRP:${extGrp}`;
      yield `${link}`;
    }
  }
}

async function fetchAndParseM3UPlaylist(token: string): Promise<PlaylistData> {
  const url = PLAYLIST_URL.replace("TOKEN", token);
  const response = await axios.get(url);
  const playlistData = response.data;
  return parseM3UPlaylist(playlistData);
}

function parseM3UPlaylist(data: string): PlaylistData {
  const lines = data.split('\n');
  const playlist = {};

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("#EXTINF:")) {
      const channelData = lines[i].match(/tvg-id="([^"]+)".*tvg-rec="([^"]+)"/);

      // Find the next line that starts with 'http'
      let url = '';
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].startsWith("http")) {
          url = lines[j];
          break;
        }
      }

      if (channelData && url) {
        playlist[channelData[1]] = { tvgRec: channelData[2], url: url };
      }
    }
  }

  return playlist as PlaylistData;
}
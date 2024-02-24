import axios from "axios";
import TvTeam from "../tvteam/tvteam.json";
import channelLineup from "../channel-lineup.json";
import { UserException } from "../../user-exception";
import { epgGenerator } from "../epg.generator";
import Free from "../free/free.json";

const PLAYLIST_URL = "http://troya.one/pl/41/TOKEN/playlist.m3u8";

type ChannelData = {
  tvgRec: string;
  timeshift: string;
  url: string;
};

type PlaylistData = Record<string, ChannelData>;

export async function* tvTeamDmGenerator(
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
  const tvteamChannels = new Map<string, typeof TvTeam[number]>();

  TvTeam.forEach(channel => {
    tvteamChannels.set(channel.channelId, channel);
  });

  for (const [channelName, channelData] of Object.entries(channelLineup)) {
    const tvteamChannel = TvTeam.find(c => c.channelName === channelName);
    const playlistData = tvteamChannel ? playlist[tvteamChannel.channelId] : undefined;

    if (playlistData) {
      yield "";
      yield `#EXTINF:0 tvg-id="${channelData.tvgId}" tvg-name="${channelData.tvgId}" tvg-logo="${channelData.tvgLogoDm}" tvg-rec="${playlistData.tvgRec}",${channelName}`;
      yield `#EXTGRP:${channelData.extGrp}`;
      yield playlistData.url;
    } else if (freeChannelSet.has(channelName)) {
      const { tvgId, tvgLogoDm, link, extGrp } = channelData;
      yield "";
      yield `#EXTINF:0 tvg-id="${tvgId}" tvg-logo="${tvgLogoDm}",${channelName}`;
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
  const playlist: PlaylistData = {};

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("#EXTINF:")) {
      const channelData = lines[i].match(/tvg-id="([^"]+)".*timeshift="([^"]+)"/);

      let url = '';
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].startsWith("http")) {
          url = lines[j];
          break;
        }
      }

      if (channelData && url) {
        playlist[channelData[1]] = { tvgRec: channelData[2], timeshift: channelData[2], url: url };
      }
    }
  }

  return playlist;
}
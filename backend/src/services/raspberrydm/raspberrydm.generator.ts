import axios from "axios";
import Raspberry from "../raspberry/raspberry.json";
import channelLineup from "../channel-lineup.json";
import { UserException } from "../../user-exception";
import { epgGenerator } from "../epg.generator";
import Free from "../free/free.json";

const PLAYLIST_URL = "https://play-berry.net/playlist/TOKEN.m3u8";

type ChannelData = {
  catchupInfo: string;
  url: string;
};

type PlaylistData = Record<string, ChannelData>;

export async function* raspberryDmGenerator(
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
  const raspberryChannels = new Map<string, Array<typeof Raspberry[number]>>();

  Raspberry.forEach(channel => {
    if (raspberryChannels.has(channel.channelName)) {
      raspberryChannels.get(channel.channelName)?.push(channel);
    } else {
      raspberryChannels.set(channel.channelName, [channel]);
    }
  });

  for (const channelName of Object.keys(channelLineup)) {
    const raspberryChannelArray = raspberryChannels.get(channelName);
    const channelData = channelLineup[channelName as keyof typeof channelLineup];

    if (raspberryChannelArray) {
      for (const raspberryChannel of raspberryChannelArray) {
        const playlistData = playlist[raspberryChannel.channelId];
        if (playlistData) {
          yield "";
          yield `#EXTINF:0 tvg-id="${channelData.tvgId}" tvg-name="${channelData.tvgId}" tvg-logo="${channelData.tvgLogoDm}" ${playlistData.catchupInfo},${channelName}`;
          yield `#EXTGRP:${channelData.extGrp}`;
          yield playlistData.url;
        }
      }
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
      // Find the index of the last quotation mark in the tvg-logo attribute
      const logoEndIndex = lines[i].indexOf('"', lines[i].indexOf('tvg-logo="') + 'tvg-logo="'.length);
      // Capture the content from the end of the tvg-logo attribute to the beginning of the channel name
      const catchupInfoStart = lines[i].indexOf(' ', logoEndIndex) + 1; // Start after the space following the closing quote of tvg-logo
      const catchupInfoEnd = lines[i].lastIndexOf(','); // The comma before the channel name
      const catchupInfo = lines[i].substring(catchupInfoStart, catchupInfoEnd).trim();

      let url = '';
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].startsWith("http")) {
          url = lines[j];
          break;
        }
      }

      // Use tvg-id as the key for the playlist object. Adjust this part if necessary to match your key selection strategy.
      const tvgIdMatch = lines[i].match(/tvg-id="([^"]+)"/);
      if (tvgIdMatch && url) {
        const tvgId = tvgIdMatch[1];
        playlist[tvgId] = { catchupInfo, url };
      }
    }
  }

  return playlist;
}
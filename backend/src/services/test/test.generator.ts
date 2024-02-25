import axios from "axios";
import Test from "./test.json";
import channelLineup from "../channel-lineup.json";
import { UserException } from "../../user-exception";
import { epgGenerator } from "../epg.generator";
import Free from "../free/free.json";
import Airtable from 'airtable';

const PLAYLIST_URL = "http://troya.one/pl/41/TOKEN/playlist.m3u8";

type ChannelData = {
  tvgRec: string;
  timeshift: string;
  url: string;
};

function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is not set`);
  }
  return value;
}

/// Initialize Airtable with the API key
const airtable = new Airtable({ apiKey: getEnvVar('AIRTABLE_API') });
console.log(`Airtable API from env var is: ${airtable}`);
const base = airtable.base(getEnvVar('AIRTABLE_BASE_ID'));

type PlaylistData = Record<string, ChannelData>;

export async function* testGenerator(
  _: string,
  token: string,
  dpt: string
): AsyncGenerator<string, void, unknown> {
  if (!token || token === "TOKEN") {
    throw new UserException("Invalid token", 400);
  }

  // Validate DPT
  await validateDptToken(dpt);

  for (const line of epgGenerator()) {
    yield line;
  }

  const playlist: PlaylistData = await fetchAndParseM3UPlaylist(token);
  const freeChannelSet = new Set(Free.map(c => c.channelName));
  const testChannels = new Map<string, Array<typeof Test[number]>>();

  Test.forEach(channel => {
    if (testChannels.has(channel.channelName)) {
      testChannels.get(channel.channelName)?.push(channel);
    } else {
      testChannels.set(channel.channelName, [channel]);
    }
  });

  for (const channelName of Object.keys(channelLineup)) {
    const testChannelArray = testChannels.get(channelName);
    const channelData = channelLineup[channelName as keyof typeof channelLineup];

    if (testChannelArray) {
      for (const testChannel of testChannelArray) {
        const playlistData = playlist[testChannel.channelId];
        if (playlistData) {
          yield "";
          yield `#EXTINF:0 tvg-id="${channelData.tvgId}" tvg-name="${channelData.tvgId}" tvg-logo="${channelData.tvgLogo}" tvg-rec="${playlistData.tvgRec}",${channelName}`;
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

// Function to validate DPT token against Airtable
async function validateDptToken(dptToken: string): Promise<void> {
  if (typeof dptToken !== 'string') {
    throw new UserException("DikoPlus token is required", 400);
  }

  try {
    const airtableName = getEnvVar('AIRTABLE_NAME');
    const airtableFieldName = getEnvVar('AIRTABLE_FIELD_NAME');

    const records = await base(airtableName)
      .select({
        filterByFormula: `{${airtableFieldName}} = '${dptToken}'`
      })
      .firstPage();

    if (records.length === 0) {
      throw new UserException("Invalid DikoPlus token", 400);
    }
  } catch (error) {
    console.error("Airtable Error:", error);
    throw new UserException("Error accessing Airtable", 500);
  }
}
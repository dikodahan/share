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
  console.log(`Retrieving environment variable '${name}': ${value ? 'found' : 'not found'}`);
  if (!value) {
    throw new Error(`Environment variable ${name} is not set`);
  }
  return value;
}

//const airtable = require('airtable');
Airtable.configure({
    endpointUrl: 'https://api.airtable.com',
    apiKey: getEnvVar('AIRTABLE_API')
});
const base = Airtable.base(getEnvVar('AIRTABLE_BASE_ID'));
/// Initialize Airtable with the API key
//const airtable = new Airtable({ apiKey: getEnvVar('AIRTABLE_API') });
//const base = require(airtable).base(getEnvVar('AIRTABLE_BASE_ID'));

type PlaylistData = Record<string, ChannelData>;

export async function* testGenerator(
  _: string,
  token: string,
  dpt: string
): AsyncGenerator<string, void, unknown> {
  if (!token || token === "TOKEN") {
    throw new UserException("Invalid token", 400);
  }

  // Validate Airtable Authentication
  const airtableInstance = await testAirtableAuthentication();

  // Validate Base and Table
  await validateAirtableBaseAndTable(airtableInstance);

  // Validate DPT Token
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

    console.log(`Attempting to fetch records from table '${airtableName}' using field '${airtableFieldName}'...`);

    const records = await base(airtableName)
      .select({
        filterByFormula: `{${airtableFieldName}} = '${dptToken}'`
      })
      .firstPage();

    if (records.length === 0) {
      throw new UserException("Invalid DikoPlus token", 400);
    }
    console.log('Record fetched successfully from Airtable.');
  } catch (error) {
    console.error("Error fetching records from Airtable:", error);
    throw new UserException("Error fetching records from Airtable", 500);
  }
}

async function testAirtableAuthentication() {
  try {
    const testAirtable = new Airtable({ apiKey: getEnvVar('AIRTABLE_API') });
    console.log('Airtable authentication test passed.');
    return testAirtable;
  } catch (error) {
    console.error('Airtable authentication test failed:', error);
    throw new UserException("Error with Airtable authentication", 500);
  }
}

async function validateAirtableBaseAndTable(airtable: Airtable) {
  try {
    const base = airtable.base(getEnvVar('AIRTABLE_BASE_ID'));
    const tableName = getEnvVar('AIRTABLE_NAME');
    console.log(`Testing access to base ID '${getEnvVar('AIRTABLE_BASE_ID')}' and table '${tableName}'...`);

    // Test if we can retrieve metadata about the table
    const table = base(tableName);
    await table.select({ maxRecords: 1 }).firstPage();
    console.log('Access to Airtable base and table verified.');
  } catch (error) {
    console.error('Error accessing Airtable base or table:', error);
    throw new UserException("Error accessing Airtable base or table", 500);
  }
}

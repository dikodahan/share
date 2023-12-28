import * as fs from "fs";
import * as path from "path";
import axios from 'axios';
import ComparisonServices from "./comparison-services.json";
import ChannelLineup from "./services/channel-lineup.json";


export interface ChannelInfo {
  channelName: string;
  channelId: string | number;
}

// Function to fetch last modified date from GitHub
async function fetchLastModifiedDate(serviceName: string): Promise<string> {
  const url = `https://api.github.com/repos/[username]/[repository]/contents/backend/src/services/${serviceName}/${serviceName}.json`;
  
  try {
    const response = await axios.get(url);
    return response.data.commit.author.date; // Assuming this is where the date is located
  } catch (error) {
    console.error(`Error fetching last modified date for ${serviceName}:`, error);
    return '';
  }
}

type ChannelStats = { [key: string]: ChannelInfo[] };

const names = ["livego", "antifriz", "tvteam", "crystal", "dino", "edem"];
const channels: ChannelStats = {};

names.forEach((name) => {
  const file = path.join(
    __dirname,
    "..",
    "backend",
    "services",
    name,
    `${name}.json`
  );
  console.log(`reading '${file}'`);
  const data = fs.readFileSync(file, "utf8");
  const records = JSON.parse(data) as ChannelInfo[];
  channels[name] = records;
});

const output = path.join(
  __dirname,
  "..",
  "..",
  "public",
  "service-channel-names.json"
);
console.log(`writing to ${output} ${Object.keys(channels)} services`);
fs.writeFileSync(output, JSON.stringify(channels, null, 2));

Object.entries(channels).forEach(([service, channelInfos]) => {
  const info = ComparisonServices.find((s) => s.service === service);
  if (info) {
    const extraChannels = new Set(
      channelInfos
        .filter((ci) => ci.channelId === 'none' || ci.channelId === 1010)
        .map((ci) => ci.channelName)
    );
    const regularChannels = new Set(
      channelInfos
        .filter((ci) => ci.channelId !== 'none' && ci.channelId !== 1010)
        .map((ci) => ci.channelName)
    );

    const extraChannelsCount = extraChannels.size;
    const regularChannelsCount = regularChannels.size;

    info["ערוצי ישראל - אקסטרה 🆓"] = extraChannelsCount;
    info["ערוצי ישראל - ספק ✅"] = regularChannelsCount;
    info["ערוצי ישראל - סך הכל"] = extraChannelsCount + regularChannelsCount;
  }
});

names.forEach((name) => {
  const file = path.join(
    __dirname,
    "..",
    "backend",
    "services",
    name,
    `${name}.json`
  );
  console.log(`reading '${file}'`);
  const data = fs.readFileSync(file, "utf8");
  const records = JSON.parse(data) as ChannelInfo[];
  channels[name] = records;

  // Check for DikoPlus value in ComparisonServices
  const serviceInfo = ComparisonServices.find((s) => s.service === name);
  if (serviceInfo && !serviceInfo.DikoPlus) {
    // If DikoPlus is true, copy the file to the public folder
    const publicFolder = path.join(
      __dirname,
      "..",
      "..",
      "public",
      `${name}.json`
    );
    fs.copyFileSync(file, publicFolder);
    console.log(`Copied '${name}.json' to public folder`);
  }
});

// Update the 'updated' field in ComparisonServices
async function updateServiceDates() {
  for (const name of names) {
    const lastModifiedDate = await fetchLastModifiedDate(name);
    const serviceInfo = ComparisonServices.find((s) => s.service === name);
    if (serviceInfo && lastModifiedDate) {
      serviceInfo.updated = lastModifiedDate;
    }
  }
}

// Call this function at the appropriate place in your existing code flow
await updateServiceDates();

const comparisonServicesPath = path.join(
  __dirname,
  "..",
  "..",
  "public",
  "comparison-services.json"
);
fs.writeFileSync(
  comparisonServicesPath,
  JSON.stringify(ComparisonServices, null, 2)
);

const channelLineupPath = path.join(
  __dirname,
  "..",
  "..",
  "public",
  "channel-lineup.json"
);
fs.writeFileSync(
  channelLineupPath,
  JSON.stringify(ChannelLineup, null, 2)
);
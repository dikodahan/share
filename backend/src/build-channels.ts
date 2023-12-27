import * as fs from "fs";
import * as path from "path";
import ComparisonServices from "./comparison-services.json";
import ChannelLineup from "./services/channel-lineup.json";


export interface ChannelInfo {
  channelName: string;
  channelId: string | number;
}

type ChannelStats = { [key: string]: ChannelInfo[] };

const names = ["livego", "antifriz", "tvteam", "crystal", "dino", "edem"];
const channels: ChannelStats = {};



// Function to get the last modified date of a file
function getLastModifiedDate(filePath: string): string {
  const stats = fs.statSync(filePath);
  return stats.mtime.toISOString();
}

// Corrected file path for manual-services.json
const manualServicesPath = path.join(__dirname, "service", "manual-services.json");

if (fs.existsSync(manualServicesPath)) {
  const manualServicesData = fs.readFileSync(manualServicesPath, "utf8");
  const manualServices = JSON.parse(manualServicesData);
  console.log("Initial manual services:", manualServices);

  for (const channel in manualServices) {
    const channelFilePath = path.join(__dirname, "services", channel, `${channel}.json`);
    console.log(`Checking file: ${channelFilePath}`);

    if (fs.existsSync(channelFilePath)) {
      const lastModifiedDate = getLastModifiedDate(channelFilePath);
      manualServices[channel].date = lastModifiedDate;
      console.log(`Updated date for ${channel}: ${lastModifiedDate}`);
    } else {
      console.warn(`File not found for channel: ${channel}`);
    }
  }

  fs.writeFileSync(manualServicesPath, JSON.stringify(manualServices, null, 2));
  console.log("Updated manual services:", manualServices);
} else {
  console.error(`File not found: ${manualServicesPath}`);
}



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
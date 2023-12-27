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


// Read the manual-services.json file
const manualServicesPath = path.join(__dirname, "./services/manual-services.json");
const manualServicesRaw = fs.readFileSync(manualServicesPath, "utf8");
const manualServices = JSON.parse(manualServicesRaw);
// Function to get the last modified date of a file
function getLastModifiedDate(filePath: string): string {
  const stats = fs.statSync(filePath);
  return stats.mtime.toISOString(); // convert date to ISO string format
}
// Update the date for each channel
Object.keys(manualServices).forEach(channelName => {
  const channelFilePath = path.join(__dirname, `./services/${channelName}/${channelName}.json`);
  if (fs.existsSync(channelFilePath)) {
    const lastModifiedDate = getLastModifiedDate(channelFilePath);
    manualServices[channelName].date = lastModifiedDate;
  }
});
// Write the updated object back to the manual-services.json file
fs.writeFileSync(manualServicesPath, JSON.stringify(manualServices, null, 2));


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
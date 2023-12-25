import * as fs from "fs";
import * as path from "path";
import ComparisonServices from "./comparison-services.json";

export interface ChannelInfo {
  channelName: string;
  channelId: string | number; //added: Pull channl id
}

type ChannelStats = { [key: string]: ChannelInfo[] }; //added: Define ChannelStats type

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
//  channels[name] = Array.from(new Set(records.map((r) => r.channelName)));
  channels[name] = records; //added: Assigning array of ChannelInfo objects
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

// Object.entries(channels).forEach(([service, channels]) => {
//   const info = ComparisonServices.find((s) => s.service === service);
//   if (info) {
//     info["מספר ערוצי ישראל"] = channels.length;
//   }
// });

Object.entries(channels).forEach(([service, channelInfos]) => {
  const info = ComparisonServices.find((s) => s.service === service);
  if (info) {
    // Filtering channels based on channelId and extracting unique channel names
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

    // Counting unique channel names
    const extraChannelsCount = extraChannels.size;
    const regularChannelsCount = regularChannels.size;

    // Updating the ComparisonServices JSON
    info["ערוצי ישראל - אקסטרה"] = extraChannelsCount;
    info["ערוצי ישראל - ספק"] = regularChannelsCount;
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

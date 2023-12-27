import * as fs from "fs";
import * as path from "path";
import ComparisonServices from "./comparison-services.json";
import ChannelLineup from "./services/channel-lineup.json";

export interface ChannelInfo {
  channelName: string;
  channelId: string | number;
}

type ChannelStats = { [key: string]: ChannelInfo[] };

// New type for storing the external value
type ServiceExternalInfo = { [serviceName: string]: { external: boolean } };

const names = ["livego", "antifriz", "tvteam", "crystal", "dino", "edem"];
const channels: ChannelStats = {};
const servicesExternalInfo: ServiceExternalInfo = {};

names.forEach((name) => {
  // Reading channel info
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

  /// Attempt to read the external value from service.json
  try {
    const serviceFilePath = path.join(
      __dirname,
      "..",
      "backend",
      "services",
      name,
      "service.json"
    );
    console.log(`attempting to read '${serviceFilePath}'`);
    const serviceData = fs.readFileSync(serviceFilePath, "utf8");
    const serviceJson = JSON.parse(serviceData) as { external: boolean };
    servicesExternalInfo[name] = { external: serviceJson.external };
  } catch (error) {
    console.error(`Error reading service.json for ${name}:`, error.message);
    // Handle the error, e.g., by skipping this service or setting a default value
  }
});

// Writing channel info to JSON file
const output = path.join(
  __dirname,
  "..",
  "..",
  "public",
  "service-channel-names.json"
);
console.log(`writing to ${output} ${Object.keys(channels)} services`);
fs.writeFileSync(output, JSON.stringify(channels, null, 2));

// Processing and updating comparison services
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

// Writing updated comparison services to JSON file
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

// Writing channel lineup to JSON file
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

// Writing services external info to JSON file
const servicesExternalInfoPath = path.join(
  __dirname,
  "..",
  "..",
  "public",
  "services-external-info.json"
);
fs.writeFileSync(
  servicesExternalInfoPath,
  JSON.stringify(servicesExternalInfo, null, 2)
);
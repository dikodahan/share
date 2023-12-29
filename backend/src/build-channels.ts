import * as fs from "fs";
import * as path from "path";
import * as https from "https";
import ComparisonServices from "./comparison-services.json";
import ChannelLineup from "./services/channel-lineup.json";


export interface ChannelInfo {
  channelName: string;
  channelId: string | number;
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

  const serviceInfo = ComparisonServices.find((s) => s.service === name);
  if (serviceInfo && serviceInfo.DikoPlus == "📄") {
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

const getGitHubFileLastModifiedDate = (service: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const options = {
      method: "HEAD",
      host: "api.github.com",
      path: `/repos/dikodahan/share/contents/backend/src/services/${service}/${service}.json`,
      headers: { 'User-Agent': 'Node.js' }
    };

    https.get(options, res => {
      const lastModified = res.headers['last-modified'];
      if (lastModified) {
        resolve(lastModified);
      } else {
        reject("Last modified date not found");
      }
    }).on("error", e => {
      reject(e);
    });
  });
};

const updateServices = async () => {
  for (const service of ComparisonServices) {
    try {
      const lastModifiedDate = await getGitHubFileLastModifiedDate(service.service);
      service.updated = lastModifiedDate;
    } catch (error) {
      console.error(`Error updating service ${service.name}:`, error);
    }
  }

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
}

updateServices();

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
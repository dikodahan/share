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
const generics = ["SanSat"];
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

generics.forEach((generic) => {
  const file = path.join(
    __dirname,
    "..",
    "backend",
    "services",
    generic,
    `${generic}.json`
  );
  console.log(`reading '${file}'`);
  const data = fs.readFileSync(file, "utf8");
  const records = JSON.parse(data) as ChannelInfo[];
  channels[generic] = records;

  const publicFolder = path.join(
    __dirname,
    "..",
    "..",
    "public",
    `${generic}.json`
  );
  fs.copyFileSync(file, publicFolder);
  console.log(`Copied '${generic}.json' to public folder`);
});

const getGitHubFileLastCommitDate = (service: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const options = {
      method: "GET",
      host: "api.github.com",
      path: `/repos/dikodahan/share/commits?path=backend/src/services/${service}/${service}.json`,
      headers: { 'User-Agent': 'Node.js' }
    };

    let data = '';

    https.get(options, res => {
      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const commits = JSON.parse(data);
          if (commits.length > 0 && commits[0].commit && commits[0].commit.committer) {
            resolve(commits[0].commit.committer.date);
          } else {
            reject("No commits found for this file");
          }
        } catch (error) {
          reject("Error parsing response: " + error);
        }
      });
    }).on("error", e => {
      reject(e);
    });
  });
};

const updateServices = async () => {
  for (const service of ComparisonServices) {
    try {
      const lastCommitDate = await getGitHubFileLastCommitDate(service.service);
      service.updated = lastCommitDate;
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

updateServices().then(() => {
  console.log('Services updated successfully.');
}).catch(error => {
  console.error('Failed to update services:', error);
});

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



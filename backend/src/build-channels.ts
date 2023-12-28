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

// Function to fetch the last modified date from GitHub
const fetchLastModifiedDate = (name: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const url = `https://api.github.com/repos/dikodahan/share/commits?path=backend/src/services/${name}/${name}.json`;

    https.get(url, { headers: { 'User-Agent': 'Node.js' } }, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const commits = JSON.parse(data);
        if (commits.length > 0) {
          const lastCommit = commits[0];
          resolve(lastCommit.commit.author.date);
        } else {
          resolve('');
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
};

const names = ["livego", "antifriz", "tvteam", "crystal", "dino", "edem"];
const channels: ChannelStats = {};

(async () => {
  for (const name of names) {
    const lastModifiedDate = await fetchLastModifiedDate(name);
    const serviceInfo = ComparisonServices.find((s) => s.service === name);
    if (serviceInfo) {
      serviceInfo.updated = lastModifiedDate;
      
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
    }
  }

  // Save the updated ComparisonServices to a file
  fs.writeFileSync(
    path.join(__dirname, "..", "..", "public", "comparison-services.json"),
    JSON.stringify(ComparisonServices, null, 2)
  );

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
    if (serviceInfo && serviceInfo.DikoPlus) {
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
})();
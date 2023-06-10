import * as fs from "fs";
import * as path from "path";

export interface ChannelInfo {
  channelName: string;
  // extGrp: string;
  // groupTitle: string;
  // tvgId: string;
  // tvgLogo: string;
  // tvgRec: string;
  // catchupDays: string;
  // channelId: string;
}

const names = ["livego", "antifriz", "crystal", "dino", "edem"];
const channels: ChannelStats = {};

names.forEach((name) => {
  const file = path.join(__dirname, "..", "backend", "services", name, `${name}.json`);
  console.log(`reading '${file}'`);
  const data = fs.readFileSync(file, "utf8");
  const records = JSON.parse(data) as ChannelInfo[];
  channels[name] = Array.from(new Set(records.map((r) => r.channelName)));
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

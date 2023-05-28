const fs = require('fs');
const path = require("path");

const names = [
  "livego",
  "antifriz",
  "crystal",
  "dino",
  "eden"
];

const channels = {};

names.forEach((name) => {
  const file = path.join(__dirname, "services", name, `${name}.json`);
  console.log(`reading '${file}'`);
  const data = fs.readFileSync(file, 'utf8');
  const records = JSON.parse(data);
  channels[name] = Array.from(new Set(records.map(r => r.channelName)));
});

fs.writeFileSync(`../public/service-channel-names.json`, JSON.stringify(channels));
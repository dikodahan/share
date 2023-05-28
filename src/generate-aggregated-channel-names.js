const fs = require('fs');

const names = [
  "livego",
  "antifriz",
  "crystal",
  "dino",
  "eden"
];

const channels = {};

names.forEach((name) => {
  const data = fs.readFileSync(`./services/${name}/${name}.json`, 'utf8');
  const records = JSON.parse(data);
  channels[name] = Array.from(new Set(records.map(r => r.channelName)));
});

fs.writeFileSync(`../public/service-channel-names.json`, JSON.stringify(channels));
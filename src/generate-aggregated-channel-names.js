const fs = require('fs');
const path = require("path");

const names = [
  "livego",
  "antifriz",
  "crystal",
  "dino",
  "edem"
];

const comparisonFile = path.join(__dirname, "comparison.json");

const channels = {};

names.forEach((name) => {
  const file = path.join(__dirname, "services", name, `${name}.json`);
  console.log(`reading '${file}'`);
  const data = fs.readFileSync(file, 'utf8');
  const records = JSON.parse(data);
  channels[name] = Array.from(new Set(records.map(r => r.channelName)));
  const uniqueChannels = Array.from(new Set(records.map((r) => r.channelName)));

  channels[name] = {
    channels: uniqueChannels,
    count: uniqueChannels.length
  };
});

const comparisonData = fs.readFileSync(comparisonFile, 'utf8');
const comparison = JSON.parse(comparisonData);

comparison.sections.forEach((section) => {
  section.services.forEach((service) => {
    const serviceName = service.service;
    if (channels.hasOwnProperty(serviceName)) {
      service.channels = channels[serviceName].channels;
      service.count = channels[serviceName].count;
    }
  });
});

fs.writeFileSync(comparisonFile, JSON.stringify(comparison));
console.log(`Updated 'comparison.json' with count and channels.`);

const output = path.join(__dirname, "..", "public", "service-channel-names.json");
console.log(`writing to ${output} ${Object.keys(channels)} services`);
fs.writeFileSync(output, JSON.stringify(channels));
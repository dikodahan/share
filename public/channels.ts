import fs from 'fs';

const jsonFiles = [
  '../src/services/livego/livego.json',
  '../src/services/antifriz/antifriz.json',
  '../src/services/crystal/crystal.json',
  '../src/services/dino/dino.json',
  '../src/services/eden/eden.json',
];

interface Channel {
  channelName: string;
}

const channels: Set<string> = new Set();

jsonFiles.forEach((file) => {
  const data = fs.readFileSync(file, 'utf8');
  const records: Channel[] = JSON.parse(data);
  records.forEach((record) => {
    channels.add(record.channelName);
  });
});

export const channelNames: string[] = Array.from(channels);
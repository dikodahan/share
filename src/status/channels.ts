import fs from 'fs';

const jsonFiles = [
  '../services/livego/livego.json',
  '../services/antifriz/antifriz.json',
  '../services/crystal/crystal.json',
  '../services/dino/dino.json',
  '../services/eden/eden.json',
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
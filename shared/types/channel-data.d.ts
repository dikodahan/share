export interface LineupChannel {
  tvgId: string;
  tvgLogo: string;
  tvgLogoDm: string;
  extGrp: string;
  epgLink: string;
  link: string;
  name?: string;
}

export interface Channel {
  name: string;
  metadata: string;
  url: string;
  logo?: string | null;
  selectedMapping?: LineupChannel;
  tvgId?: string;
  tvgName?: string;
  groupTitle?: string;
  notWorking?: boolean;
}

export interface ChannelData {
  channelName: string;
  channelId: string;
  [key: string]: string | undefined;
}

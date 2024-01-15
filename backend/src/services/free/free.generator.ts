import Free from "./free.json";
import channelLineup from "../channel-lineup.json";
import { epgGenerator } from "../epg.generator";

const BASE_GRP = "טלוויזיה";

export function* freeGenerator(
  ): Generator<string, void, unknown> {

    for (const line of epgGenerator()) {
        yield line;
    }

    const freeChannels = new Map(Free.map(item => [item.channelName, item]));

    for (const channelName of Object.keys(channelLineup)) {
      const freeChannel = freeChannels.get(channelName);
  
      if (freeChannel) {
        const channelData = channelLineup[channelName as keyof typeof channelLineup];
  
        const { tvgId, tvgLogo, link, extGrp } = channelData;
  
        yield "";
        yield `#EXTINF:-1 tvg-id="${tvgId}" tvg-logo="${tvgLogo}" group-logo="https://raw.githubusercontent.com/dikodahan/dikodahan.github.io/master/creative/img/Categories/DikoPlus-icon.png",${channelName}`;
        if (extGrp == "רדיו") {
            yield `#EXTGRP:${extGrp}`;
        } else {
            yield `#EXTGRP:${BASE_GRP}`;
        }
        yield `${link}`;
      }
    }
  }
import Free from "./free.json";
import channelLineup from "../channel-lineup.json";
import { UserException } from "../../user-exception";
import { epgGenerator } from "../epg.generator";

for (const line of epgGenerator()) {
    yield line;
}

for (const { channelName } of Free) {
    const { extGrp, tvgId, tvgLogo, link } =
      channelLineup[channelName as keyof typeof channelLineup];
    yield "";
    yield `#EXTINF:0 tvg-id="${tvgId}" tvg-logo="${tvgLogo}",${channelName}`;
    if (extGrp == "רדיו") {
        yield `#EXTGRP:${extGrp}`;
    } else {
        yield `#EXTGRP:טלוויזיה`;
    }
    yield `${link}`;
}

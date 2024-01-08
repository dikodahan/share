import { ChannelData } from "./channel-data";

export interface MappingSubmitRequest {
    serviceName: string;
    description: string;
    channels: ChannelData[];
}
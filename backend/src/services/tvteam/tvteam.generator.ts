import TvTeam from "./tvteam.json";
import channelLineup from "../channel-lineup.json";
import { UserException } from "../../user-exception";
import { epgGenerator } from "../epg.generator";

export function* tvTeamGenerator(): Generator<string, void, unknown> {}

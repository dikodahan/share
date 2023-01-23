// @spellchecker: ignore livego
import { antiFrizGenerator } from "./antifriz/antifriz.generator";
import { liveGoGenerator } from "./livego/livego.generator";
import { liveGoDmGenerator } from "./livegodm/livegodm.generator";
import { crystalGenerator } from "./crystal/crystal.generator";
import { crystalDmGenerator } from "./crystaldm/crystaldm.generator";
import { liveGoTestGenerator } from "./livegotest/livegotest.generator";


type M3uGenerator = (username: string, password: string) => Generator<string, void, unknown>;

export const SERVICE_GENERATORS: Record<string, M3uGenerator> = {
    "livego": liveGoGenerator,
    "livegodm": liveGoDmGenerator,
    "crystal": crystalGenerator,
    "crystaldm": crystalDmGenerator,
    "antifriz": antiFrizGenerator,
    "livegotest": liveGoTestGenerator
}

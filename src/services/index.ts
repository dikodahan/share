// @spellchecker: ignore livego
import { antiFrizGenerator } from "./antifriz/antifriz.generator";
import { antiFrizDmGenerator } from "./antifrizdm/antifrizdm.generator";
import { edemGenerator } from "./edem/edem.generator";
import { liveGoGenerator } from "./livego/livego.generator";
import { liveGoDmGenerator } from "./livegodm/livegodm.generator";
import { crystalGenerator } from "./crystal/crystal.generator";
import { crystalDmGenerator } from "./crystaldm/crystaldm.generator";
import { dinoGenerator } from "./dino/dino.generator";
import { dinoDmGenerator } from "./dinodm/dinodm.generator";
import { liveGoTestGenerator } from "./livegotest/livegotest.generator";


type M3uGenerator = (username: string, password: string) => Generator<string, void, unknown>;

export const SERVICE_GENERATORS: Record<string, M3uGenerator> = {
    "livego": liveGoGenerator,
    "livegodm": liveGoDmGenerator,
    "crystal": crystalGenerator,
    "crystaldm": crystalDmGenerator,
    "dino": dinoGenerator,
    "dinodm": dinoDmGenerator,
    "antifriz": antiFrizGenerator,
    "antifrizdm": antiFrizDmGenerator,
    "edem": edemGenerator,
    "livegotest": liveGoTestGenerator
}

// @spellchecker: ignore livego
import { antiFrizGenerator } from "./antifriz/antifriz.generator";
import { liveGoGenerator } from "./livego/livego.generator";
import { crystalGenerator } from "./crystal/crystal.generator";

type M3uGenerator = (username: string, password: string) => Generator<string, void, unknown>;

export const SERVICE_GENERATORS: Record<string, M3uGenerator> = {
    "livego": liveGoGenerator,
    "crystal": crystalGenerator,
    "antifriz": antiFrizGenerator
}

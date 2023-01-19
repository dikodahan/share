// @spellchecker: ignore livego
import { liveGoGenerator } from "./livego/livego.generator";

type M3uGenerator = (username: string, password: string) => Generator<string, void, unknown>;

export const SERVICE_GENERATORS: Record<string, M3uGenerator> = {
    "livego": liveGoGenerator
}
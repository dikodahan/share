import { liveGoGenerator } from "./livego/livego.generator";
import { liveGoDmGenerator } from "./livegodm/livegodm.generator";
import { liveGoUsGenerator } from "./livegous/livegous.generator";
import { antiFrizGenerator } from "./antifriz/antifriz.generator";
import { antiFrizDmGenerator } from "./antifrizdm/antifrizdm.generator";
import { edemGenerator } from "./edem/edem.generator";
import { edemDmGenerator } from "./edemdm/edemdm.generator";
import { dinoGenerator } from "./dino/dino.generator";
import { dinoDmGenerator } from "./dinodm/dinodm.generator";
import { testGenerator } from "./test/test.generator";
import { crystalGenerator } from "./crystal/crystal.generator";
import { crystalDmGenerator } from "./crystaldm/crystaldm.generator";
import { freeGenerator } from "./free/free.generator";
import { nachotoyAsyncGenerator } from "./vod/nachotoy.generator";
import "./tvteam/tvteam.json";
import "./sansat/sansat.json";

type M3uGenerator = (
  username: string,
  password: string
) => Generator<string, void, unknown>;

type vodGenerator = (
  username: string,
  password: string
) => AsyncGenerator<string, void, unknown>;

export const SERVICE_GENERATORS: Record<string, M3uGenerator> = {
  livegous: liveGoUsGenerator,
  livego: liveGoGenerator,
  livegodm: liveGoDmGenerator,
  dino: dinoGenerator,
  dinodm: dinoDmGenerator,
  antifriz: antiFrizGenerator,
  antifrizdm: antiFrizDmGenerator,
  edem: edemGenerator,
  edemdm: edemDmGenerator,
  test: testGenerator,
  crystal: crystalGenerator,
  crystaldm: crystalDmGenerator,
  free: freeGenerator,
};

export const AsyncServiceGenerators: Record<string, vodGenerator> = {
  nachotoy: nachotoyAsyncGenerator,
};
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
import { moviesGenerator } from "./movies/movies.generator";
import { nachotoyGenerator } from "./vod/nachotoy.generator";
import { tvTeamGenerator } from "./tvteam/tvteam.generator";
import { tvTeamDmGenerator } from "./tvteamdm/tvteamdm.generator";
import { reflexGenerator } from "./reflex/reflex.generator";
import { reflexDmGenerator } from "./reflexdm/reflexdm.generator";
import "./sansat/sansat.json";

type M3uGenerator = (
  username: string,
  password: string
) => Generator<string, void, unknown>;

type AsyncM3uGenerator = (
  username: string,
  password: string,
) => AsyncGenerator<string, void, unknown>;

type AuthAsyncM3uGenerator = (
  username: string,
  password: string,
  dpt: string
) => AsyncGenerator<string, void, unknown>;

type VodGenerator = (
  userUrl: string
) => Promise<string>;

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
  crystal: crystalGenerator,
  crystaldm: crystalDmGenerator,
  free: freeGenerator,
};

export const ASYNC_SERVICE_GENERATORS: Record<string, AsyncM3uGenerator> = {
  tvteam: tvTeamGenerator,
  tvteamdm: tvTeamDmGenerator,
  reflex: reflexGenerator,
  reflexdm: reflexDmGenerator,
  movies: moviesGenerator,
};

export const AUTH_ASYNC_SERVICE_GENERATORS: Record<string, AuthAsyncM3uGenerator> = {
  test: testGenerator,
};

export const VOD_GENERATORS: Record<string, VodGenerator> = {
  nachotoy: nachotoyGenerator,
};
import { cachedJson } from "./cache";
import type { Berry, EvolutionChain, Pokemon, Species } from "./schemas";
import {
  berrySchema,
  evolutionChainSchema,
  generationSchema,
  pokemonSchema,
  resourceListSchema,
  speciesSchema,
  typeSchema,
} from "./schemas";

export const API_BASE = "https://pokeapi.co/api/v2";

/** Total in the national dex we expose (Gen 1–9). */
export const POKEMON_COUNT = 1025;
export const PAGE_SIZE = 30;

export const ALL_TYPES = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
] as const;

export type TypeName = (typeof ALL_TYPES)[number];

export const idFromUrl = (url: string): number => {
  const match = url.match(/\/(?<id>\d+)\/?$/u);
  return match?.groups?.id ? Number(match.groups.id) : 0;
};

export const fetchPokemonList = async (
  limit: number,
  offset: number,
  fetcher: typeof fetch = fetch
) => {
  const json = await cachedJson(
    `${API_BASE}/pokemon?limit=${limit}&offset=${offset}`,
    fetcher
  );
  return resourceListSchema.parse(json);
};

export const fetchPokemon = async (
  nameOrId: string | number,
  fetcher: typeof fetch = fetch
): Promise<Pokemon> => {
  const json = await cachedJson(`${API_BASE}/pokemon/${nameOrId}`, fetcher);
  return pokemonSchema.parse(json);
};

export const fetchSpecies = async (
  url: string,
  fetcher: typeof fetch = fetch
): Promise<Species> => {
  const json = await cachedJson(url, fetcher);
  return speciesSchema.parse(json);
};

export const fetchEvolutionChain = async (
  url: string,
  fetcher: typeof fetch = fetch
): Promise<EvolutionChain> => {
  const json = await cachedJson(url, fetcher);
  return evolutionChainSchema.parse(json);
};

export const fetchType = async (
  name: string,
  fetcher: typeof fetch = fetch
) => {
  const json = await cachedJson(`${API_BASE}/type/${name}`, fetcher);
  return typeSchema.parse(json);
};

export const fetchGeneration = async (
  id: number,
  fetcher: typeof fetch = fetch
) => {
  const json = await cachedJson(`${API_BASE}/generation/${id}`, fetcher);
  return generationSchema.parse(json);
};

export const fetchBerryList = async (fetcher: typeof fetch = fetch) => {
  const json = await cachedJson(`${API_BASE}/berry?limit=64`, fetcher);
  return resourceListSchema.parse(json);
};

export const fetchBerry = async (
  name: string,
  fetcher: typeof fetch = fetch
): Promise<Berry> => {
  const json = await cachedJson(`${API_BASE}/berry/${name}`, fetcher);
  return berrySchema.parse(json);
};

export const statTotal = (pokemon: Pokemon): number =>
  pokemon.stats.reduce((sum, s) => sum + s.base_stat, 0);

export const formatName = (name: string): string =>
  name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export const formatDexNumber = (id: number): string =>
  `#${String(id).padStart(4, "0")}`;

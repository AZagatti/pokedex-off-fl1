import { describe, expect, it } from "vitest";

import {
  berrySchema,
  evolutionChainSchema,
  pokemonSchema,
  resourceListSchema,
} from "./schemas";

describe("resourceListSchema", () => {
  it("parses a PokeAPI list payload", () => {
    const parsed = resourceListSchema.parse({
      count: 1302,
      results: [
        { name: "bulbasaur", url: "https://pokeapi.co/api/v2/pokemon/1/" },
      ],
    });
    expect(parsed.results[0].name).toBe("bulbasaur");
  });

  it("rejects malformed payloads", () => {
    expect(() =>
      resourceListSchema.parse({ count: "x", results: [] })
    ).toThrow();
  });
});

describe("pokemonSchema", () => {
  it("parses a minimal pokemon payload", () => {
    const parsed = pokemonSchema.parse({
      id: 25,
      name: "pikachu",
      height: 4,
      weight: 60,
      types: [{ slot: 1, type: { name: "electric", url: "" } }],
      stats: [{ base_stat: 35, stat: { name: "hp", url: "" } }],
      abilities: [{ is_hidden: false, ability: { name: "static", url: "" } }],
      moves: [{ move: { name: "thunder-shock", url: "" } }],
      sprites: {
        front_default: "x.png",
        back_default: null,
        front_shiny: null,
        back_shiny: null,
      },
      species: {
        name: "pikachu",
        url: "https://pokeapi.co/api/v2/pokemon-species/25/",
      },
    });
    expect(parsed.types[0].type.name).toBe("electric");
  });
});

describe("evolutionChainSchema", () => {
  it("parses recursive chains", () => {
    const parsed = evolutionChainSchema.parse({
      id: 1,
      chain: {
        species: { name: "bulbasaur", url: "" },
        evolves_to: [
          {
            species: { name: "ivysaur", url: "" },
            evolves_to: [
              { species: { name: "venusaur", url: "" }, evolves_to: [] },
            ],
          },
        ],
      },
    });
    expect(parsed.chain.evolves_to[0].evolves_to[0].species.name).toBe(
      "venusaur"
    );
  });
});

describe("berrySchema", () => {
  it("parses a berry payload", () => {
    const parsed = berrySchema.parse({
      id: 1,
      name: "cheri",
      growth_time: 3,
      max_harvest: 5,
      size: 20,
      smoothness: 25,
      soil_dryness: 15,
      firmness: { name: "soft", url: "" },
      flavors: [{ potency: 10, flavor: { name: "spicy", url: "" } }],
      item: { name: "cheri-berry", url: "" },
    });
    expect(parsed.flavors[0].flavor.name).toBe("spicy");
  });
});

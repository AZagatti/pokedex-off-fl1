import { describe, expect, it } from "vitest";

import { formatDexNumber, formatName, idFromUrl, statTotal } from "./client";
import type { Pokemon } from "./schemas";

describe("idFromUrl", () => {
  it("extracts the trailing id", () => {
    expect(idFromUrl("https://pokeapi.co/api/v2/pokemon/25/")).toBe(25);
    expect(idFromUrl("https://pokeapi.co/api/v2/pokemon-species/1")).toBe(1);
  });

  it("returns 0 when there is no id", () => {
    expect(idFromUrl("https://pokeapi.co/api/v2/pokemon/")).toBe(0);
  });
});

describe("formatName", () => {
  it("capitalizes hyphenated names", () => {
    expect(formatName("mr-mime")).toBe("Mr Mime");
    expect(formatName("pikachu")).toBe("Pikachu");
  });
});

describe("formatDexNumber", () => {
  it("pads to four digits", () => {
    expect(formatDexNumber(6)).toBe("#0006");
    expect(formatDexNumber(1025)).toBe("#1025");
  });
});

describe("statTotal", () => {
  it("sums base stats", () => {
    const pokemon = {
      stats: [
        { base_stat: 10, stat: { name: "hp", url: "" } },
        { base_stat: 20, stat: { name: "attack", url: "" } },
      ],
    } as Pokemon;
    expect(statTotal(pokemon)).toBe(30);
  });
});

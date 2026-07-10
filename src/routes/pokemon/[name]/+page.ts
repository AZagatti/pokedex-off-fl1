import {
  fetchEvolutionChain,
  fetchPokemon,
  fetchSpecies,
} from "$lib/api/client";
import type { EvolutionChain, Species } from "$lib/api/schemas";
import { error } from "@sveltejs/kit";

import type { PageLoad } from "./$types";

export const prerender = false;

export const load: PageLoad = async ({ params, fetch }) => {
  try {
    const pokemon = await fetchPokemon(params.name, fetch);
    let species: Species | null = null;
    let evolution: EvolutionChain | null = null;
    try {
      species = await fetchSpecies(pokemon.species.url, fetch);
      if (species.evolution_chain) {
        evolution = await fetchEvolutionChain(
          species.evolution_chain.url,
          fetch
        );
      }
    } catch {
      // Species/evolution data is progressive enhancement; the page works without it.
    }
    return { pokemon, species, evolution };
  } catch {
    error(404, `Pokémon "${params.name}" not found`);
  }
};

import { z } from "zod";

export const namedResourceSchema = z.object({
  name: z.string(),
  url: z.string(),
});

export const resourceListSchema = z.object({
  count: z.number(),
  results: z.array(namedResourceSchema),
});

export const pokemonSchema = z.object({
  id: z.number(),
  name: z.string(),
  height: z.number(),
  weight: z.number(),
  types: z.array(
    z.object({
      slot: z.number(),
      type: namedResourceSchema,
    })
  ),
  stats: z.array(
    z.object({
      base_stat: z.number(),
      stat: namedResourceSchema,
    })
  ),
  abilities: z.array(
    z.object({
      is_hidden: z.boolean(),
      ability: namedResourceSchema,
    })
  ),
  moves: z.array(
    z.object({
      move: namedResourceSchema,
    })
  ),
  sprites: z.object({
    front_default: z.string().nullable(),
    back_default: z.string().nullable(),
    front_shiny: z.string().nullable(),
    back_shiny: z.string().nullable(),
    other: z
      .object({
        "official-artwork": z
          .object({
            front_default: z.string().nullable(),
            front_shiny: z.string().nullable().optional(),
          })
          .optional(),
      })
      .optional(),
  }),
  cries: z
    .object({
      latest: z.string().nullable().optional(),
      legacy: z.string().nullable().optional(),
    })
    .optional(),
  species: namedResourceSchema,
});

export type Pokemon = z.infer<typeof pokemonSchema>;

export const speciesSchema = z.object({
  id: z.number(),
  name: z.string(),
  evolution_chain: z.object({ url: z.string() }).nullable(),
  flavor_text_entries: z.array(
    z.object({
      flavor_text: z.string(),
      language: namedResourceSchema,
    })
  ),
  genera: z.array(
    z.object({
      genus: z.string(),
      language: namedResourceSchema,
    })
  ),
});

export type Species = z.infer<typeof speciesSchema>;

const chainLinkBase = z.object({
  species: namedResourceSchema,
});

export type ChainLink = z.infer<typeof chainLinkBase> & {
  evolves_to: ChainLink[];
};

export const chainLinkSchema: z.ZodType<ChainLink> = chainLinkBase.extend({
  evolves_to: z.lazy(() => z.array(chainLinkSchema)),
});

export const evolutionChainSchema = z.object({
  id: z.number(),
  chain: chainLinkSchema,
});

export type EvolutionChain = z.infer<typeof evolutionChainSchema>;

export const typeSchema = z.object({
  name: z.string(),
  pokemon: z.array(
    z.object({
      pokemon: namedResourceSchema,
    })
  ),
});

export const generationSchema = z.object({
  id: z.number(),
  name: z.string(),
  pokemon_species: z.array(namedResourceSchema),
});

export const berrySchema = z.object({
  id: z.number(),
  name: z.string(),
  growth_time: z.number(),
  max_harvest: z.number(),
  size: z.number(),
  smoothness: z.number(),
  soil_dryness: z.number(),
  firmness: namedResourceSchema,
  flavors: z.array(
    z.object({
      potency: z.number(),
      flavor: namedResourceSchema,
    })
  ),
  item: namedResourceSchema,
});

export type Berry = z.infer<typeof berrySchema>;

import { fetchBerry } from "$lib/api/client";
import { error } from "@sveltejs/kit";

import type { PageLoad } from "./$types";

export const prerender = false;

export const load: PageLoad = async ({ params, fetch }) => {
  try {
    return { berry: await fetchBerry(params.name, fetch) };
  } catch {
    error(404, `Berry "${params.name}" not found`);
  }
};

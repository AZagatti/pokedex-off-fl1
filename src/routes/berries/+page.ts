import { fetchBerryList } from "$lib/api/client";

import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch }) => {
  const list = await fetchBerryList(fetch);
  return { berries: list.results };
};

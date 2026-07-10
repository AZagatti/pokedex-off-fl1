import { browser } from "$app/environment";

const STORAGE_KEY = "pokedex:favorites";

const load = (): string[] => {
  if (!browser) {
    return [];
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string")
      : [];
  } catch {
    return [];
  }
};

class FavoritesStore {
  names = $state<string[]>(load());

  has(name: string): boolean {
    return this.names.includes(name);
  }

  toggle(name: string): void {
    this.names = this.has(name)
      ? this.names.filter((n) => n !== name)
      : [...this.names, name];
    if (browser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.names));
    }
  }
}

export const favorites = new FavoritesStore();

import { browser } from "$app/environment";

const STORAGE_KEY = "pokedex:theme";

export type Theme = "light" | "dark";

const initial = (): Theme => {
  if (!browser) {
    return "light";
  }
  const attr = document.documentElement.dataset.theme;
  return attr === "dark" ? "dark" : "light";
};

class ThemeStore {
  current = $state<Theme>(initial());

  toggle(): void {
    this.current = this.current === "dark" ? "light" : "dark";
    if (browser) {
      document.documentElement.dataset.theme = this.current;
      localStorage.setItem(STORAGE_KEY, this.current);
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute(
          "content",
          this.current === "dark" ? "#0b1120" : "#f6f7fb"
        );
    }
  }
}

export const theme = new ThemeStore();

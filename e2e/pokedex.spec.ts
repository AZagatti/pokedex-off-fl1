import { expect, test } from "@playwright/test";

test.describe("Pokédex list", () => {
  test("loads the card grid with infinite scroll", async ({ page }) => {
    await page.goto("./");
    await expect(page.getByTestId("pokemon-card").first()).toBeVisible({
      timeout: 30_000,
    });
    const initial = await page.getByTestId("pokemon-card").count();
    expect(initial).toBeGreaterThanOrEqual(30);
    await page.mouse.wheel(0, 20_000);
    await expect
      .poll(() => page.getByTestId("pokemon-card").count(), {
        timeout: 30_000,
      })
      .toBeGreaterThan(initial);
  });

  test("search narrows the grid and empty state shows for garbage", async ({
    page,
  }) => {
    await page.goto("./");
    await expect(page.getByTestId("pokemon-card").first()).toBeVisible({
      timeout: 30_000,
    });
    await page.getByTestId("search-input").fill("bulbasaur");
    await expect(page.getByTestId("pokemon-card")).toHaveCount(1, {
      timeout: 15_000,
    });
    await page.getByTestId("search-input").fill("zzzzzz");
    await expect(page.getByText("No Pokémon found")).toBeVisible({
      timeout: 15_000,
    });
    await page.getByTestId("clear-filters").click();
    await expect(page.getByTestId("pokemon-card").first()).toBeVisible({
      timeout: 30_000,
    });
  });

  test("type + generation filters compose", async ({ page }) => {
    await page.goto("./");
    await expect(page.getByTestId("pokemon-card").first()).toBeVisible({
      timeout: 30_000,
    });
    await page.getByTestId("type-filter-dragon").click();
    await page.getByTestId("generation-select").selectOption("1");
    await expect(page.getByTestId("pokemon-card")).toHaveCount(3, {
      timeout: 30_000,
    });
    await expect(page.getByText("Dratini")).toBeVisible();
  });
});

test.describe("Detail page", () => {
  test("shows stats, abilities, evolution chain and sprite switcher", async ({
    page,
  }) => {
    await page.goto("./pokemon/charizard");
    await expect(page.getByTestId("pokemon-name")).toHaveText("Charizard", {
      timeout: 30_000,
    });
    await expect(page.getByRole("meter").first()).toBeVisible();
    await expect(page.getByText("Blaze")).toBeVisible();
    await expect(
      page.locator('[aria-labelledby="evolution-heading"] a')
    ).toHaveCount(3);
    await page.getByRole("button", { exact: true, name: "Shiny" }).click();
    await expect(
      page.getByRole("button", { exact: true, name: "Shiny" })
    ).toHaveAttribute("aria-pressed", "true");
    await page.getByTestId("back-link").click();
    await expect(page.getByTestId("pokemon-grid")).toBeVisible({
      timeout: 30_000,
    });
  });

  test("unknown pokemon shows the 404 page", async ({ page }) => {
    await page.goto("./pokemon/not-a-real-mon");
    await expect(page.getByText("404")).toBeVisible({ timeout: 30_000 });
  });
});

test.describe("Berries", () => {
  test("lists berries and opens a detail", async ({ page }) => {
    await page.goto("./berries");
    await expect(page.getByTestId("berry-card").first()).toBeVisible({
      timeout: 30_000,
    });
    await page.getByTestId("berry-card").first().click();
    await expect(page.getByTestId("berry-name")).toContainText("Berry", {
      timeout: 30_000,
    });
    await expect(page.getByText("Growth time")).toBeVisible();
  });
});

test.describe("Favorites & theme", () => {
  test("favorites persist across reload", async ({ page }) => {
    await page.goto("./");
    await expect(page.getByTestId("pokemon-card").first()).toBeVisible({
      timeout: 30_000,
    });
    await page
      .getByRole("button", { name: "Add Bulbasaur to favorites" })
      .click();
    await page.goto("./favorites");
    await expect(page.getByText("Bulbasaur")).toBeVisible({ timeout: 30_000 });
    await page.reload();
    await expect(page.getByText("Bulbasaur")).toBeVisible({ timeout: 30_000 });
    await page
      .getByRole("button", { name: "Remove Bulbasaur from favorites" })
      .click();
    await expect(page.getByText("No favorites yet")).toBeVisible();
  });

  test("theme toggle flips and persists", async ({ page }) => {
    await page.goto("./");
    const theme = () =>
      page.evaluate(() => document.documentElement.dataset.theme);
    const before = await theme();
    await page.getByTestId("theme-toggle").click();
    const after = await theme();
    expect(after).not.toBe(before);
    await page.reload();
    expect(await theme()).toBe(after);
  });
});

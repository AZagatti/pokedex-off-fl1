import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";

export default defineConfig({
  extends: [core],
  ignorePatterns: [
    ...core.ignorePatterns,
    "docs/**",
    "build/**",
    ".svelte-kit/**",
  ],
  overrides: [
    {
      // Svelte components are PascalCase by convention, and $state()
      // bindings look unreassigned to the linter.
      files: ["**/*.svelte"],
      rules: {
        "eslint/prefer-const": "off",
        "unicorn/filename-case": "off",
      },
    },
  ],
  rules: {
    // Zod schemas and test fixtures mirror PokeAPI's field order; sorting
    // them alphabetically hurts readability against the API docs.
    "eslint/sort-keys": "off",
  },
});

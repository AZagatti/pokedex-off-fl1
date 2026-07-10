import adapter from "@sveltejs/adapter-static";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit({
      compilerOptions: {
        runes: ({ filename }) =>
          filename.split(/[/\\]/u).includes("node_modules") ? undefined : true,
      },
      adapter: adapter({
        fallback: "404.html",
      }),
      // Inline the small global stylesheet into the HTML to remove the
      // render-blocking CSS request.
      inlineStyleThreshold: 16_384,
      paths: {
        base: process.env.NODE_ENV === "development" ? "" : "/pokedex-off-fl1",
      },
    }),
  ],
  test: {
    include: ["src/**/*.{test,spec}.{js,ts}"],
    environment: "node",
  },
});

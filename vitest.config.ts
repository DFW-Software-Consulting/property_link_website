import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // `server-only` throws outside the RSC bundler's `react-server` export
      // condition; alias it to a no-op so server modules can be unit-tested.
      "server-only": fileURLToPath(
        new URL("./src/test/empty-module.ts", import.meta.url),
      ),
    },
  },
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text-summary", "lcov"],
      // Measure the logic layer only. Vitest runs in the node environment with
      // no jsdom/RTL, so components and RSC pages are not renderable here and
      // would otherwise report as permanently uncovered, hiding real gaps.
      // `include` reports on every matching file, not just imported ones.
      include: ["src/lib/**", "src/app/api/**"],
      exclude: [
        // Static content and type-only modules: no branches to exercise.
        "src/lib/data/**",
        "src/lib/cms/types.ts",
        "src/lib/cms/constants.ts",
        "src/lib/application.ts",
        "src/lib/site-config.ts",
        "src/lib/utils.ts",
        // Thin framework wiring, exercised by the build rather than by units.
        "src/lib/get-query-client.ts",
      ],
      // Ratchet: set just below the level reached when the logic-layer suite
      // landed, so a regression fails CI. Raise these as coverage improves.
      thresholds: {
        statements: 92,
        branches: 85,
        functions: 90,
        lines: 92,
      },
    },
  },
});

import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import vue from "@vitejs/plugin-vue"
import { defineConfig } from "vitest/config"

export default defineConfig(({ mode }) => {
  const resolveAlias: Record<string, string> = {
    "@": path.resolve(__dirname, "./src"),
  }

  /** Replace heavy chart runtime during `vitest` only (dynamic import in TrendChart). */
  if (mode === "test" || process.env.VITEST === "true") {
    resolveAlias["vue3-apexcharts"] = path.resolve(__dirname, "./src/test-stubs/vue3-apexcharts.ts")
  }

  return {
    plugins: [vue(), tailwindcss()],
    resolve: {
      alias: resolveAlias,
    },
    test: {
      environment: "happy-dom",
      globals: false,
      coverage: {
        provider: "v8",
        include: ["src/composables/**/*.ts", "src/components/*.vue"],
        exclude: ["**/*.spec.ts", "**/*.d.ts"],
      },
    },
  }
})

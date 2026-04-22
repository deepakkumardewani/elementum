import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import vue from "@vitejs/plugin-vue"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "happy-dom",
    globals: false,
    coverage: {
      provider: "v8",
      include: ["src/composables/**/*.ts"],
      exclude: ["**/*.spec.ts", "**/*.d.ts"],
    },
  },
})

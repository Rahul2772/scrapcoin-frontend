import { cloudflare } from "@cloudflare/vite-plugin";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { sentryVitePlugin } from "@sentry/vite-plugin";

export default defineConfig({
  plugins: [
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tanstackStart({
      server: { entry: "server" },
    }),
    viteReact(),
    tailwindcss(),
    tsconfigPaths(),
    // Only upload source maps when SENTRY_AUTH_TOKEN is available (CI / production build)
    ...(process.env.SENTRY_AUTH_TOKEN
      ? [
          sentryVitePlugin({
            authToken: process.env.SENTRY_AUTH_TOKEN,
            org: process.env.SENTRY_ORG || "scrapco",
            project: process.env.SENTRY_PROJECT || "scrapcoin-frontend",
            telemetry: false,
          }),
        ]
      : []),
  ],
  build: {
    // Source maps required for readable Sentry stack traces in production
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("@supabase")) {
              return "supabase";
            }
            if (id.includes("recharts") || id.includes("d3-")) {
              return "recharts-vendor";
            }
            return "vendor";
          }
        },
      },
    },
  },
  server: {
    port: 5173,
    strictPort: false,
  },
});

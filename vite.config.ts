import { cloudflare } from "@cloudflare/vite-plugin";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { sentryVitePlugin } from "@sentry/vite-plugin";

type ModuleInfoLookup = (id: string) => { importers: readonly string[]; dynamicImporters: readonly string[] } | null;

/** True for jsPDF and the packages only jsPDF pulls in (canvg, core-js, dompurify…).
 *  Shared helpers such as @babel/runtime (also used by recharts) return false. */
function onlyUsedByJsPdf(id: string, getModuleInfo: ModuleInfoLookup, seen = new Set<string>()): boolean {
  if (/[\\/]node_modules[\\/]jspdf[\\/]/.test(id)) return true;
  if (seen.has(id)) return true;
  seen.add(id);
  const info = getModuleInfo(id);
  const importers = info ? [...info.importers, ...info.dynamicImporters] : [];
  return (
    importers.length > 0 &&
    importers.every((imp) => imp.includes("node_modules") && onlyUsedByJsPdf(imp, getModuleInfo, seen))
  );
}

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
            // Maps go to Sentry only; never ship them to the public site
            sourcemaps: { filesToDeleteAfterUpload: ["./dist/**/*.map"] },
          }),
        ]
      : []),
  ],
  build: {
    // "hidden" writes .map files for the Sentry upload but leaves out the
    // sourceMappingURL comment; the Sentry plugin deletes them after upload.
    // Without a Sentry token there's nothing to upload them to, so skip them.
    sourcemap: process.env.SENTRY_AUTH_TOKEN ? "hidden" : false,
    rollupOptions: {
      output: {
        manualChunks(id, { getModuleInfo }) {
          if (id.includes("node_modules")) {
            // Only loaded by the PDF exports via import("jspdf"); keep it out of
            // "vendor" so it isn't downloaded on every page
            if (onlyUsedByJsPdf(id, getModuleInfo)) {
              return "jspdf";
            }
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

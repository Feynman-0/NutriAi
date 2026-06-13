import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tsConfigPaths(),
    tanstackStart({
      tsr: {
        appDirectory: "src",
        autoCodeSplitting: true,
        routesDirectory: "src/routes",
        generatedRouteTree: "src/routeTree.gen.ts",
      },
      server: {
        entry: "src/server.ts",
      },
    }),
    react(),
    tailwindcss(),
  ],
});

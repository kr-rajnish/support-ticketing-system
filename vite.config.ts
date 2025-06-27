/// <reference types="node" />

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

// __dirname replacement for ESM
const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@/components": resolve(__dirname, "./src/components"),
      "@/pages": resolve(__dirname, "./src/pages"),
      "@/store": resolve(__dirname, "./src/store"),
      "@/types": resolve(__dirname, "./src/types"),
      "@/utils": resolve(__dirname, "./src/utils"),
      "@/hooks": resolve(__dirname, "./src/hooks"),
    },
  },
  define: {
    global: "globalThis",
  },
  server: {
    port: 3000,
    host: true,
  },
});

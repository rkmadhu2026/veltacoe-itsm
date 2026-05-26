import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// VeltaCore ITSM — Vite config
// Dev: http://127.0.0.1:5174 (5173 is reserved for another local project)
// Build: `vite build` emits to dist/, hashed assets, single index.html entry.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  server: {
    host: "127.0.0.1",
    port: 5174,
    strictPort: true,
  },
  preview: {
    host: "127.0.0.1",
    port: 4173,
    strictPort: true,
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    target: "es2022",
    cssMinify: "lightningcss",
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          router: ["react-router-dom"],
        },
      },
    },
  },
});

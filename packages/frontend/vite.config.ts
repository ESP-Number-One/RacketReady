import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA, VitePWAOptions } from "vite-plugin-pwa";

const PWA_OPTIONS: Partial<VitePWAOptions> = {
  srcDir: "sw",
  filename: "index.ts",
  strategies: "injectManifest", // Make our own service worker!
  registerType: "autoUpdate",
  devOptions: {
    navigateFallback: "index.html",
    type: "module",
    enabled: true,
  },
  injectManifest: {
    injectionPoint: undefined,
  },
  manifest: {
    // TODO: Add manifest details in a WebManifest.
  },
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), VitePWA(PWA_OPTIONS)],
  server: {
    watch: {
      usePolling: true,
    },
    host: true, // needed for the Docker Container port mapping to work
    strictPort: true, // not necessary
    port: 3000, // you can replace this port with any port
  },
  publicDir: "./static",
});

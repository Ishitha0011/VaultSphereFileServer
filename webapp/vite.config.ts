import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import image from "@rollup/plugin-image";
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svgr(), image(), react(), vanillaExtractPlugin()],
  server: {
    proxy: {
      '/rest': {
        target: 'http://localhost:3041',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});

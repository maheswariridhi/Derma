import { defineConfig, type UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from 'path'

// https://vite.dev/config/
export default defineConfig<UserConfig>({
  plugins: [
    react({
      include: "**/*.{jsx,tsx}",
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});

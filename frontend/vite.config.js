import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Dev-сервер ходит на бэкенд через прокси, чтобы не упираться в CORS.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: "127.0.0.1",
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
      "/uploads": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});

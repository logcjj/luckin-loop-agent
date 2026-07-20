import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/luckin-loop-agent/",
  plugins: [react()],
  server: {
    proxy: {
      "/api/guide": "http://127.0.0.1:8787"
    }
  }
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  base: "/trust_calculator_react/",
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api/stockDay": {
        target: "https://www.twse.com.tw/",
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(/^\/api\/stockDay/, "/exchangeReport/STOCK_DAY"),
      },
    },
  },
});

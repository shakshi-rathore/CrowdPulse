import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { tr } from "date-fns/locale";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    port: 3000,
    open: true,
    // 👇 ADD THIS PROXY SECTION
    proxy: {
      '/polls': {
        target: 'https://cgcsdvpdw8.execute-api.ap-south-1.amazonaws.com/Prod',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});

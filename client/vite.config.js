import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // Listen di 0.0.0.0 → bisa diakses dari HP lewat WiFi
    port: 5173,
  },
});

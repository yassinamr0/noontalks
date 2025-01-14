import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          qr: ["html5-qrcode", "qrcode.react"],
          pdf: ["html2canvas", "jspdf"],
        },
      },
    },
  },
  optimizeDeps: {
    include: ["html5-qrcode", "qrcode.react", "html2canvas", "jspdf"],
  },
  server: {
    port: 3000,
  },
  publicDir: "public",
});

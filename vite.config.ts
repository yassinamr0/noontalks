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
          vendor: ["react", "react-dom", "react-router-dom", "sonner"],
          qr: ["html5-qrcode", "qrcode.react"],
          pdf: ["html2canvas", "jspdf"],
          ui: ["@radix-ui/react-toast", "@radix-ui/react-alert-dialog", "@radix-ui/react-label", "@radix-ui/react-slot"]
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      "html5-qrcode",
      "qrcode.react",
      "html2canvas",
      "jspdf",
      "sonner",
      "@radix-ui/react-toast",
      "@radix-ui/react-alert-dialog",
      "@radix-ui/react-label",
      "@radix-ui/react-slot"
    ],
  },
  server: {
    port: 3000,
  },
  publicDir: "public",
});

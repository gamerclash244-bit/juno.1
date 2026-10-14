import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    // three.js + the 3D model viewer make one large chunk; that's expected for this site
    chunkSizeWarningLimit: 1600,
  },
});

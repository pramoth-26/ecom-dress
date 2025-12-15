import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer } from "./server";

// ✅ FIXED CONFIG
export default defineConfig(({ mode }) => ({
  root: ".", // Make sure root is current project directory
  server: {
    host: "0.0.0.0", // Accessible on localhost and network
    port: 8080,
    fs: {
      // ✅ Allow serving from project root, client, and shared folders
      allow: [
        path.resolve(__dirname, "."),
        path.resolve(__dirname, "client"),
        path.resolve(__dirname, "shared"),
      ],
      // ✅ Securely deny sensitive files
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },
  build: {
    outDir: "dist/spa",
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

// ✅ Keep express plugin isolated for dev server
function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during dev
    configureServer(server) {
      const app = createServer();
      server.middlewares.use(app);
    },
  };
}

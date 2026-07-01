import path from "node:path";
import { fileURLToPath } from "node:url";
import { crx } from "@crxjs/vite-plugin";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

import manifest from "./manifest.json";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Force every workspace package to share ONE copy of React.
// Without this, @karakeep/shared-react's nested react@19.2.3 collides
// with the extension's own react@19.2.6, producing the classic
// "Cannot read properties of null (reading 'useMemo')" runtime error.
// Anchor to the monorepo-root React (pnpm workspace hoists it there).
const reactRoot = path.resolve(__dirname, "../../node_modules/react");
const reactDomRoot = path.resolve(__dirname, "../../node_modules/react-dom");

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    crx({
      manifest,
      browser: process.env.VITE_BUILD_FIREFOX ? "firefox" : "chrome",
    }),
  ],
  resolve: {
    alias: {
      react: reactRoot,
      "react-dom": reactDomRoot,
      "react/jsx-runtime": path.resolve(reactRoot, "jsx-runtime.js"),
      "react/jsx-dev-runtime": path.resolve(reactRoot, "jsx-dev-runtime.js"),
    },
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react/jsx-runtime"],
  },
  server: {
    cors: {
      origin: [/chrome-extension:\/\//],
    },
  },
});

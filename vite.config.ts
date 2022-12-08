import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import wasmPack from "vite-plugin-wasm-pack";

// https://vitejs.dev/config/
export default defineConfig(async () => {
  // Use async import as a workaround for using mdx.
  // See: https://github.com/brillout/vite-plugin-mdx/issues/44
  // @ts-ignore
  const mdx = await import("@mdx-js/rollup");
  // @ts-ignore
  const remarkGfm = await import("remark-gfm");
  // Set base="/elara/" as a workaround for hosting on GitHub Pages.
  // See: https://dev.to/shashannkbawa/deploying-vite-app-to-github-pages-3ane
  return {
    server: {
      watch: {
        // This prevents an issue where Vite tries to rebuild
        // the TypeScript files before the Rust files are built.
        ignored: ["!**/node_modules/elara-lib/**"],
      },
    },
    optimizeDeps: {
      exclude: ["elara-lib"],
    },
    base: "/elara/",
    root: "web",
    plugins: [
      wasmPack("./elara-lib"),
      react(),
      mdx.default({ remarkPlugins: [remarkGfm.default as any] }),
    ],
  };
});

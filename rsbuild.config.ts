import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { TanStackRouterRspack } from "@tanstack/router-plugin/rspack";
import { pluginBabel } from "@rsbuild/plugin-babel";

export const ReactCompilerConfig = {
  target: "19", // '17' | '18' | '19'
};
export default defineConfig({
  plugins: [
    pluginReact(),
    pluginBabel({
      include: /\.(?:jsx|tsx)$/,
      babelLoaderOptions(opts) {
        opts.plugins?.unshift("babel-plugin-react-compiler");
      },
    }),
  ],
  source: {
    entry: { index: "./src/main.tsx" },
  },
  html: {
    template: "./index.html",
  },
  tools: {
    rspack: {
      plugins: [TanStackRouterRspack()],
    },
  },
});

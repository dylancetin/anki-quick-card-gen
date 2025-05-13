/// <reference types="@rsbuild/core/types" />
import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { TanStackRouterRspack } from "@tanstack/router-plugin/rspack";
import { pluginBabel } from "@rsbuild/plugin-babel";
import { pluginNodePolyfill } from "@rsbuild/plugin-node-polyfill";
import { RsdoctorRspackPlugin } from "@rsdoctor/rspack-plugin";

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
    pluginNodePolyfill(),
  ],
  source: {
    entry: { index: "./src/main.tsx" },
    assetsInclude: /\.md$/,
  },
  html: {
    template: "./index.html",
  },
  tools: {
    rspack: {
      plugins: [
        TanStackRouterRspack(),
        process.env.RSDOCTOR &&
          new RsdoctorRspackPlugin({
            // plugin options
          }),
      ],
    },
  },
});

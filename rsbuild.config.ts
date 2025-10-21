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
  environments: {
    web: {
      source: {
        entry: {
          index: "./src/main.tsx",
        },
        assetsInclude: (name) => {
          if (name.includes("node_modules")) return false;
          if (name.includes("src/lib/htmls")) return true;
          return /\.(md)$/.test(name);
        },
      },
      html: {
        template: "./index.html",
      },
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
      tools: {
        rspack: {
          plugins: [
            TanStackRouterRspack(),
            process.env.RSDOCTOR && new RsdoctorRspackPlugin(),
            // new ServiceWorkerPlugin(),
          ],
        },
      },
    },
    worker: {
      source: {
        entry: {
          index: "./src/lib/service-worker-plugin.ts",
        },
      },
      output: {
        target: "web-worker",

        distPath: {
          js: "",
        },
        filename: {
          js: "service-worker.js",
        },
      },
    },
  },
});

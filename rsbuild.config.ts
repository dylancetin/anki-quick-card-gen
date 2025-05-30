/// <reference types="@rsbuild/core/types" />
import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { TanStackRouterRspack } from "@tanstack/router-plugin/rspack";
import { pluginBabel } from "@rsbuild/plugin-babel";
import { pluginNodePolyfill } from "@rsbuild/plugin-node-polyfill";
import { RsdoctorRspackPlugin } from "@rsdoctor/rspack-plugin";
import { Rspack } from "@rsbuild/core";

const isProduction = process.env.NODE_ENV === "production";

class ServiceWorkerPlugin implements Rspack.RspackPluginInstance {
  private readonly name = "ServiceWorkerPlugin";

  apply(compiler: Rspack.Compiler) {
    compiler.hooks.make.tapAsync(this.name, (compilation, callback) => {
      const entryPath = "src/lib/service-worker-plugin.ts";
      const outPath = "service-worker.js";

      try {
        const childCompiler = compilation.createChildCompiler(
          `${this.name}-child-compiler`,
          {
            publicPath: "",
            filename: outPath,
          },
          [
            new compiler.rspack.EntryPlugin(compiler.context, entryPath, {
              name: "service-worker",
              publicPath: "",
              filename: outPath,
            }),
          ],
        );

        childCompiler.options = {
          ...childCompiler.options,
          resolve: compiler.options.resolve,
          module: compiler.options.module,
          devtool: false,
          plugins: [],
          target: "webworker",
          devServer: {
            hot: false,
          },
          output: {
            ...childCompiler.options.output,
            iife: false,
            path: outPath,
          },
        };

        childCompiler.runAsChild((err, _, childCompilation) => {
          if (err) {
            compilation.errors.push(err);
            return callback(err);
          }

          if (childCompilation && childCompilation.errors.length > 0) {
            compilation.errors.push(...childCompilation.errors);
          }

          callback();
        });
      } catch (error) {
        callback(error as Error);
      }
    });
  }
}

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
    assetsInclude: (name) => {
      if (name.includes("node_modules")) return false;
      if (name.includes("src/lib/htmls")) return true;
      console.log(name);
      return /\.(md)$/.test(name);
    },
  },
  html: {
    template: "./index.html",
  },
  tools: {
    rspack: {
      plugins: [
        TanStackRouterRspack(),
        process.env.RSDOCTOR && new RsdoctorRspackPlugin(),
        new ServiceWorkerPlugin(),
      ],
    },
  },
});

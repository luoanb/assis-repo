import { defineConfig } from "epm-repo/defineConfig";
import { aliasPath } from "esbuild-plugin-alias-path";
import { sassPlugin } from "@es-pack/esbuild-sass-plugin";
import path from "path";
import { cwd } from "process";
export default defineConfig(async () => {
  return {
    esbuild: {
      loader: {
        ".svg": "dataurl",
      },
      external: ["vscode"],
      plugins: [
        aliasPath({
          alias: {
            "@/*": path.resolve(cwd(), "./src_modules/assis-front/src"),
          },
        }),
        sassPlugin(),
      ],
    },
  };
});

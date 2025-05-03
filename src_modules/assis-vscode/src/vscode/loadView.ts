import * as vscode from "vscode";
import fs from "fs";
import path from "path";

export interface IContent {
  folder: string;
  encoding: BufferEncoding;
}

export type IPlugin = {
  regex: RegExp | RegExp[];
  replace: (source: RegExpMatchArray, content: IContent) => string;
};

export type IReplace = (value: string) => string;

export type IPluginCreate<T = void> = (props: T) => IPlugin;

/**
 * 解析WebView
 */
export class LoadView {
  // const regex = /import\s+"([^"]+)"/;
  // private static instance: LoadView;
  // private constructor() {}
  // /**
  //  * 获取实例
  //  * @returns
  //  */
  // static getInstance() {
  //   if (LoadView.instance) {
  //     return LoadView.instance;
  //   }
  //   LoadView.instance = new LoadView();
  //   return LoadView.instance;
  // }

  readonly relpaces: IReplace[] = [];

  readonly plugins: IPlugin[] = [];

  readFile(folder: string, src: string, encoding: BufferEncoding = "utf8") {
    const htmlPath = vscode.Uri.file(path.join(folder, src));
    try {
      let str = fs.readFileSync(htmlPath.fsPath, { encoding });
      for (const replace of this.relpaces) {
        str = replace(str);
      }
      for (const plugin of this.plugins) {
        const regs: RegExp[] = ([] as RegExp[]).concat(plugin.regex);
        for (const reg of regs) {
          str = str.replace(reg, (sourceStr) => {
            let flieStr = plugin.replace(
              sourceStr.match(reg) as RegExpMatchArray,
              { folder, encoding }
            );
            return flieStr;
          });
        }
      }
      return str;
    } catch (error) {
      console.error("readFile:err", error);
      return "";
    }
  }

  /**
   * 渲染指定文件：会递归处理内容导入
   */
  render(folder: string, src: string, encoding: BufferEncoding = "utf8") {
    return this.readFile(folder, src, encoding);
  }
}

const loadView = new LoadView();

/**
 * 静态导入 import "xxx" @import url(xxx)
 * @returns
 */
export const ImportJsCss: IPluginCreate = () => {
  return {
    regex: [/import\s+"([^"]+)"/, /@import\s+url\(([^)]+)\);/],
    replace(reg, content) {
      return loadView.readFile(
        content.folder,
        reg[reg.length - 1],
        content.encoding
      );
    },
  };
};

loadView.plugins.push(ImportJsCss());

/**
 * 数据渲染 {{key}}
 * @param props 数据
 * @returns
 */
export const dataRender: IPluginCreate<any> = (props) => {
  return {
    regex: [/\{\{.*?\}\}/g],
    replace: (reg, content) => {
      const key = reg[reg.length - 1].replace("{{", "").replace("}}", "");
      return props[key];
    },
  };
};

export { loadView };

import * as vscode from "vscode";
import fs from "fs";
import path from "path";
import { LoadView, dataRender } from "./loadView";

export interface ICreateViewProps {
  /**
   * vscode.context
   */
  context: vscode.ExtensionContext;
  /**
   * 文件名
   */
  src: string;
  /**
   * 相对路径:从src起始: 如 src/view
   */
  subFolder: string;
  /**
   * 页面标识符
   */
  viewType: string;
  /**
   * 页面标题
   */
  title: string;
  /**
   * 文本编码
   * @default "utf8"
   */
  encoding?: BufferEncoding;
  /**
   * 展示窗口
   */
  viewColumn?: vscode.ViewColumn;
}

/**
 * 创建一个展示页
 * @param param0
 * @param 插件本地文件请用 \<script>"[[file://vue-simple-markdown.js]]";\</script>
 * @returns
 */
export const createView = ({
  context,
  viewType,
  title,
  subFolder,
  src,
  viewColumn = vscode.ViewColumn.Two,
  encoding = "utf8",
}: ICreateViewProps) => {
  // 创建 WebviewPanel
  const panel = vscode.window.createWebviewPanel(
    viewType, // 标识页面类型，用于内部区分不同的页面
    title, // 页面标题
    viewColumn, // 以哪个编辑器列打开
    {
      enableScripts: true, // 允许页面使用 JavaScript
      retainContextWhenHidden: true,
    }
  );

  /**
   * 本地静态链接处理
   * @param htmlIndexPath
   * @returns
   */
  const replaceStatic = (htmlIndexPath: string) => {
    const geturl = (url: any) => panel.webview.asWebviewUri(url);
    const html = htmlIndexPath.replace(
      /(<link.+?href="|<script.+?src="|<img.+?src=")(.+?)"/g,
      (m, $1, $2) => {
        const url = vscode.Uri.joinPath(context.extensionUri, subFolder, $2);
        const webviewUri = geturl(url);
        const replaceHref = $1 + webviewUri.toString() + '"';
        return replaceHref;
      }
    );
    return html;
  };

  // 获取插件根目录
  const extensionPath = context.extensionPath;

  // loadView.plugins.push(
  //   dataRender({
  //     base: vscode.Uri.file(path.join(extensionPath, subFolder)),
  //   })
  // );

  const loadView = new LoadView();

  loadView.relpaces.push((value) => replaceStatic(value));

  const htmlContent = loadView.render(
    vscode.Uri.file(path.join(extensionPath, subFolder)).fsPath,
    src,
    encoding
  );
  // 设置 WebviewPanel 内容
  panel.webview.html = htmlContent;
  return panel;
};

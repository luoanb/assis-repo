// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import fs from "fs/promises";
import {
  getSelectFromWorkspace,
  readFileAsString,
  registerCommand,
} from "./base";
import { assisVscode, assisBackend } from "assis-vscode";
import * as assisGeneral from "assis-general";
import { ServeContext, allservices } from "./service";

import { assistantCreate } from "./assistant";
import path from "path";

/**
 * 创建配置文件夹
 */
const mkdirAssisFolder = async () => {
  const folderUrl = vscode.Uri.joinPath(
    vscode.workspace.workspaceFolders?.[0]?.uri as any,
    ".assis"
  ).fsPath;
  await fs.mkdir(folderUrl);
};

const getSHowViewColumn = () => {
  const activeCol = vscode.window.activeTextEditor?.viewColumn;
  if (activeCol !== vscode.ViewColumn.Two) {
    return vscode.ViewColumn.Two;
  } else {
    return vscode.ViewColumn.One;
  }
};
const deb = assisGeneral.createDebounce(500);
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "assistant" is now active!');

  const assistant = assistantCreate({
    saveFolder: path.join(context.extensionPath, "thinklowdb"),
  });

  const serve = new assisVscode.ServiceCore<ServeContext>({
    assistant,
  });

  serve.mountSubscriptions(allservices);
  assistant.decisionCore.pushInstance(
    assisBackend.getToastPlugin((msg: any) => serve.notify("/socket", msg))
  );

  // 监听编辑器选中内容更改事件
  vscode.window.onDidChangeTextEditorSelection((event) => {
    // event.textEditor 是发生更改的编辑器
    // event.selections 是新的选中内容列表
    deb(async () => {
      const textEditor = event.textEditor;
      if (textEditor.selection) {
        const workspace = vscode.workspace.workspaceFolders?.[0].uri.path || "";
        serve.notify("/socket", {
          type: "selectChange",
          data: {
            select: getSelectFromWorkspace(),
            file: await readFileAsString(textEditor.document.uri.fsPath),
            path: textEditor.document.uri.path.replace(workspace, ""),
          }, // 只记录工作区相对路径
        });
      }
    });
  });

  const clientInit = () => {
    mkdirAssisFolder();
    const panel = assisVscode.createView({
      context,
      subFolder: "front/",
      src: "index.html",
      viewType: "ai-chat",
      title: "AI: 开始聊天",
      viewColumn: getSHowViewColumn(),
    });

    return serve.mountServer(panel);
  };

  registerCommand(context, "showPage", async () => {
    if (!serve.panelInstances.length) {
      clientInit();
    }
  });

  registerCommand(context, "openInfile", async (fs: vscode.Uri) => {
    console.log("openInfile", serve.panelInstances);

    const notify = async () => {
      const workspace = vscode.workspace.workspaceFolders?.[0].uri.path || "";
      serve.notify("/socket", {
        type: "openInfile",
        data: {
          select: getSelectFromWorkspace(),
          file: await readFileAsString(fs.fsPath),
          path: fs.path.replace(workspace, ""),
        }, // 只记录工作区相对路径
      });
    };

    if (!serve.panelInstances.length) {
      await clientInit();
      await notify();
    } else {
      await notify();
      serve.panelInstances[0]?.reveal(getSHowViewColumn());
    }
  });
}

// This method is called when your extension is deactivated
export function deactivate() {}

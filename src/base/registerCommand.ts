import * as vscode from "vscode";

/**
 * 注册事件
 * @param context
 * @param command
 * @param callback
 * @param thisArg
 */
export const registerCommand = (
  context: vscode.ExtensionContext,
  command: string,
  callback: any,
  thisArg?: any
) => {
  let disposable = vscode.commands.registerCommand(
    "assistant." + command,
    callback,
    thisArg
  );
  context.subscriptions.push(disposable);
};

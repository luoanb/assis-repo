import { assisBackend, assisVscode } from "assis-vscode";
import * as vscode from "vscode";

/**
 * 使用lowdb，对于已存在的文件，并不会写入默认value
 * @param param0
 * @returns
 */
export const useLowDB = async <T>(fileName: string, defaultValue: T) => {
  let JSONFilePreset = (await import("cjs-lowdb/node")).JSONFilePreset;
  const folderUrl = vscode.Uri.joinPath(
    vscode.workspace.workspaceFolders?.[0]?.uri as any,
    ".assis",
    fileName
  ).fsPath;
  return await JSONFilePreset(folderUrl, defaultValue);
};

/**
 * 缓存聊天历史记录
 * @returns
 */
export const useChatList = async (fileName = "chatList") => {
  let db = await assisVscode.useWorkspaceLowDB(fileName + ".json", {
    messages: [] as any[],
  });
  const push = (...msgs: assisBackend.IMsg[]) => {
    db.update((data) => {
      if (!data.messages) {
        data.messages = msgs;
      } else {
        data.messages.push(...msgs);
      }
    });
  };
  return {
    db,
    push,
  };
};

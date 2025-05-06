import { PathLike } from "fs";
import * as vscode from "vscode";
import { useLowDB } from "../../backend/base/lowdb";

/**
 * 使用lowdb:存入工作区文件夹，对于已存在的文件，并不会写入默认value
 * @param fileName
 * @param defaultValue
 * @returns
 */
export const useWorkspaceLowDB = async <T>(
  fileName: string,
  defaultValue: T
) => {
  const folderUrl = vscode.Uri.joinPath(
    vscode.workspace.workspaceFolders?.[0]?.uri as any,
    ".assis",
    fileName
  ).fsPath;
  return await useLowDB(folderUrl, defaultValue);
};

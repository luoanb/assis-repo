import * as vscode from "vscode";
import fs from "fs";
import path from "path";

export * from "./registerCommand";

/**
 * 获取一个Promise 外置了reslove，reject
 * @returns
 */
export const getPromise = <T>() => {
  let reslove: (value: T) => void, reject: (err: any) => void;
  let promise = new Promise<T>((r, j) => {
    reslove = r;
    reject = j;
  });
  return {
    promise,
    // @ts-ignore
    reslove,
    // @ts-ignore
    reject,
  };
};
/**
 * 按照utf-8格式读取文件
 * @param filePath
 * @returns
 */
export const readFileAsString = (
  filePath: any,
  encoding: BufferEncoding = "utf-8"
) => {
  const res = getPromise<string>();
  fs.readFile(filePath, encoding, (err, data) => {
    // 如果出错，打印错误信息
    if (err) {
      res.reject(err);
    } else {
      res.reslove(data);
    }
  });
  return res.promise;
};

/**
 * 获取工作目录的.assis.json的配置信息 返回JSON对象
 * @returns
 */
export const getConfig = async () => {
  try {
    let folder = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
    if (folder) {
      let filePath = path.join(folder, "/.assis.json");
      let str = await readFileAsString(filePath);
      return JSON.parse(str);
    } else {
      throw new Error("您未打开工作目录");
    }
  } catch (error) {
    return {};
  }
};

/**
 * 获取工作区选择内容
 * @returns
 */
export const getSelectFromWorkspace = () => {
  // 获取当前活动的文本编辑器
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    const selection = editor.selection;
    return {
      position: editor.selection.active,
      start: selection.start,
      end: selection.end,
      context: editor.document.getText(selection),
      selection,
    };
  }
  return null;
};

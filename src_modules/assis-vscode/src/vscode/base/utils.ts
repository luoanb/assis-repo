import { getPromise } from "assis-general";
import fs from "fs";
import path from "path";
import * as vscode from "vscode";
import { Exception } from "./exception";

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
      throw new Exception("您未打开工作目录");
    }
  } catch (error) {
    console.log(error, "json的配置信息:error");
    return {};
  }
};

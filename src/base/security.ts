import * as vscode from "vscode";
import { Exception } from "./exception";
import path from "path";

/**
 * 安全措施
 */
export class Security {
  /**
   * 获取工作路径
   * @returns
   */
  static getWorkUrl = () => {
    let workPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workPath) {
      throw new Exception(`找不到工作目录: Security.getSafeFilePath: ${path}`);
    }
    return workPath;
  };

  static getSafeFilePath(filepath: string) {
    const workPath = this.getWorkUrl();
    if (filepath.indexOf(workPath) > -1) {
      return filepath;
    } else {
      return path.join(workPath, filepath);
    }
  }
  /**
   * 禁用指令
   */
  static unSafeShellCMD: string[] = [];

  // /**
  //  * 获取安全的shell脚本
  //  */
  // static getSafeShell(shell: string) {
  //   try {
  //     let [cmd, ...others] = shell.split(" ");
  //     if (this.unSafeShellCMD.includes(cmd)) {
  //       throw new Exception(
  //         `Security.getSafeShell: shell: ${shell} 属于不安全指令`
  //       );
  //     }
  //   } catch (error) {
  //     throw new Exception(`Security.getSafeShell: shell: ${shell} 指令不正确`);
  //   }

  //   return shell;
  // }
}

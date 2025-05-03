import * as vscode from "vscode";
export enum ToastType {
  None = "none",
  Info = "info",
  Error = "error",
  Warn = "warn",
}

export interface ExceptionOptions extends ErrorOptions {
  /**
   * 提示类型
   * @default Error
   */
  type?: ToastType;
}
/**
 * 异常统一处理
 */
export class Exception extends Error {
  constructor(msg: string, options?: ExceptionOptions) {
    super(msg, options);
    switch (options?.type || ToastType.Error) {
      case ToastType.Error:
        vscode.window.showErrorMessage(msg);
        break;
      case ToastType.Info:
        vscode.window.showInformationMessage(msg);
        break;
      case ToastType.Warn:
        vscode.window.showWarningMessage(msg);
        break;
      default:
        break;
    }
  }
}

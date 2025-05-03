import * as vscode from 'vscode'
import { ExceptionOptions, ToastType } from '../../backend/base/types'

/**
 * 异常统一处理
 */
export class Exception extends Error {
  constructor(msg: string, options?: ExceptionOptions) {
    super(msg)
    switch (options?.type || ToastType.Error) {
      case ToastType.Error:
        vscode.window.showErrorMessage(msg)
        break
      case ToastType.Info:
        vscode.window.showInformationMessage(msg)
        break
      case ToastType.Warn:
        vscode.window.showWarningMessage(msg)
        break
      default:
        break
    }
  }
}

export enum ToastType {
  None = 'none',
  Info = 'info',
  Error = 'error',
  Warn = 'warn'
}

export interface ExceptionOptions {
  /**
   * 提示类型
   * @default Error
   */
  type?: ToastType
}

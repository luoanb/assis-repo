/**
 *  本文件用于在在WebView中与vscode通信 , 作用于Web端
 */

/**
 * 响应状态
 */
export enum Code {
  /** 正常 */
  success = 200,
  /** 错误 */
  err = 500
}

export const createSuccessMsg = <T>(url: string, data: T, isNotDone = false) => {
  return {
    url,
    data,
    isNotDone,
    code: Code.success,
    msg: ''
  } as PluginMsg<T>
}

export const createErrorMsg = (url: string, msg: string) => {
  return {
    url,
    data: null,
    code: Code.err,
    msg
  } as PluginMsg
}
/**
 * 服务消息
 */
export interface PluginMsg<T = null> {
  /**
   * 标识流式输出是否完成
   */
  isNotDone?: boolean
  /**
   * 服务标识
   */
  url: string
  /**
   * 状态
   */
  code: Code
  /**
   * 负载
   */
  data: T
  /**
   * 提示
   */
  msg: string
}

declare global {
  interface Window {
    _vscode: any
    acquireVsCodeApi(): any
  }
}
// declare function acquireVsCodeApi(): any

/**
 * 获取vscodeAPI实例
 **/
export const getVscodeInstance = () => {
  if (window._vscode) {
    return window._vscode
  }
  // @ts-expect-error
  window._vscode = acquireVsCodeApi()
  return window._vscode
}

/**
 * 长连接请求
 * @param url 请求链接地址
 * @param callback 消息回调
 * @returns 断开连接方法
 */
export const socketRequest = (url: string, callback: (data: any) => void) => {
  window.addEventListener('message', (event) => {
    if (event.data.url == url) {
      callback?.(event.data)
    }
  })
  return () => {
    window.removeEventListener('message', callback)
  }
}

/**
 * 请求插件响应
 * @param {type} url 请求服务地址
 * @param {type} data 请求数据
 * @param {type} option.timeout=5000
 */
export const request = <R, T = any>(url: string, data: T, { timeout = 5000 } = {}) => {
  return new Promise<R>((r, j) => {
    const vscode = getVscodeInstance()
    let isReslove = false
    const responseCallback = (event: MessageEvent<any>) => {
      if (event.data.url === url) {
        isReslove = true
        window.removeEventListener('message', responseCallback)
        r(event.data)
      }
      setTimeout(() => {
        if (!isReslove) {
          window.removeEventListener('message', responseCallback)
          j({
            code: 500,
            type: 'timeout',
            message: '请求超时'
          })
        }
      }, timeout)
    }
    window.addEventListener('message', responseCallback)
    vscode.postMessage({
      url,
      data
    })
  })
}

/**
 * 流式请求插件响应
 * @param {type} url 请求服务地址
 * @param {type} data 请求数据
 * @param {type} option.timeout=5000
 */
export const streamRequest = function <R = any, T = any>(
  url: string,
  data: T,
  onChunked: (value: PluginMsg<R>) => void,
  { timeout = 5000 } = {}
) {
  const vscode = getVscodeInstance()
  let clean: any = null
  const responseCallback = (event: MessageEvent<any>) => {
    if (event.data.url === url) {
      if (clean) {
        clearTimeout(clean)
        clean = setTimeout(() => {
          window.removeEventListener('message', responseCallback)
          onChunked?.(createErrorMsg(url, '请求超时') as any)
        }, timeout)
      }
      onChunked?.(event.data)
    }
  }
  window.addEventListener('message', responseCallback)
  clean = setTimeout(() => {
    window.removeEventListener('message', responseCallback)
    onChunked?.(createErrorMsg(url, '请求超时') as any)
  }, timeout)
  vscode.postMessage({
    url,
    data
  })
}

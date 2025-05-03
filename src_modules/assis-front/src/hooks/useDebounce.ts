import { useRef } from 'react'

export type Callback = (...props: any[]) => void

/**
 * 节流 hook内，组件内使用
 * @param callback
 * @param delay 默认1000（1s）
 * @returns
 */
export function useThrottle<T extends Callback = Callback>(callback: T, delay: number = 1000) {
  const lastExec = useRef(0)

  const thfun: Callback = (...args) => {
    const now = Date.now()
    if (now - lastExec.current < delay) {
      return
    }

    lastExec.current = now
    callback(...args)
  }
  return thfun as T
}

/**
 * 节流 hook外,组件外使用
 * @param {*} func
 * @param {*} delay 默认1000（1s）
 * @returns
 */
export function createThrottle<T extends Callback = Callback>(callback: T, delay: number = 1000) {
  let lastExec = 0

  const thfun: Callback = (...args) => {
    const now = Date.now()
    if (now - lastExec < delay) {
      return
    }

    lastExec = now
    callback(...args)
  }
  return thfun as T
}

/**
 * 创建防抖方法:hook外, 组件外使用
 * @param {*} func
 * @param {*} delay 默认1500（1.5s）
 * @returns
 */
export const createDebounce = <T extends Callback = Callback>(func: T, delay = 1500) => {
  let timeoutId: any = null
  const defun: Callback = (...args) => {
    clearTimeout(timeoutId)

    timeoutId = setTimeout(() => {
      func(...args)
    }, delay)
  }
  return defun
}

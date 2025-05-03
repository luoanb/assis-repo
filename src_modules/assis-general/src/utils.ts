import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'
/**
 * 获取一个Promise 外置了reslove，reject
 * @returns
 */
export const getPromise = <T>() => {
  let reslove: (value: T) => void, reject: (err: any) => void
  let promise = new Promise<T>((r, j) => {
    reslove = r
    reject = j
  })
  return {
    promise,
    // @ts-ignore
    reslove,
    // @ts-ignore
    reject
  }
}

export function createDebounce(delay: number): (func: () => void) => void {
  let timer: any = null

  return function debounced(func: () => void) {
    if (timer) {
      clearTimeout(timer)
    }

    timer = setTimeout(() => {
      func()
      timer = null
    }, delay)
  }
}

/**
 * 获取一个唯一键
 * @returns
 */
export function createUniqueString() {
  function getRandomValues(array: any) {
    if (!(array instanceof Uint8Array)) {
      throw new Error('getRandomValues only accepts Uint8Array')
    }

    const randomBytes = crypto.randomBytes(array.length)
    for (let i = 0; i < array.length; i++) {
      array[i] = randomBytes[i]
    }

    return array
  }

  return uuidv4({
    random: getRandomValues(new Uint8Array(16))
  })
}

interface IStorage {
  type?: string
  value?: any
  time?: number
}

/**
 * 封装了localStorage, 支持存储任意数据, 不仅是字符串
 */
export const storageLocal = {
  rm: (key: string) => {
    return localStorage.removeItem(key)
  },
  get: (key: string, fullInfo = false): any | null => {
    const str = localStorage.getItem(key)
    const data = (str ? JSON.parse(str) : {}) as IStorage
    return fullInfo ? data : data.value
  },
  set: (key: string, val: any) => {
    const data = {
      type: typeof val,
      value: val,
      time: new Date().getTime()
    }
    return localStorage.setItem(key, JSON.stringify(data))
  },
  clear: () => {
    return localStorage.clear()
  }
}

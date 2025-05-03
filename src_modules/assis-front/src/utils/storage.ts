interface IStorage {
  type?: string
  value?: any
  time?: number
}
import * as front from '@/utils/vscodeFrontend'

/**
 * 封装了localStorage, 支持存储任意数据, 不仅是字符串
 */
export const storage = {
  rm: (key: string) => {
    return front.request('/storage', { type: 'set', key, value: null })
  },
  get: (key: string): Promise<string> => {
    return front.request('/storage', { type: 'get', key })
  },
  set: (key: string, val: any) => {
    return front.request<string>('/storage', { type: 'set', key, value: val })
  },
  clear: () => {}
}

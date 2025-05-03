import { ObjectKey, StateReturn } from "./types"

export const createStore = () => {
  // const data: Record<ObjectKey, any> = {};
  const data = new WeakMap()

  /**
   * 创建state
   * @param defaultValue
   * @returns
   */
  const createState = <T, V = StateReturn<T>>(defaultValue: T) => {
    const statekey: any = Symbol('store-statekey')

    data.set(statekey, defaultValue)

    const isObject = typeof defaultValue === 'object'

    /**
     * 给 对象/数组 添加属性
     * @param key
     * @param value
     */
    const push = (key: ObjectKey, value: any) => {
      if (!data.get(statekey)) {
        if (typeof key === 'number') {
          data.set(statekey, [])
        } else {
          data.set(statekey, {})
        }
      }
      data.get(statekey)[key] = value
    }

    const result: V = {
      /**
       * 取值
       */
      get value() {
        return data.get(statekey) as T
      },
      /**
       * 赋值
       * @param value
       */
      set(value: T) {
        data.set(statekey, value)
      },
      /**
       * 给 对象/数组 添加属性
       * @param key
       * @param value
       */
      push: isObject ? push : null
    } as any
    return result
  }
  return {
    createState
  }
}

export const gloabalStore = createStore()

export type Callback = (...props: any[]) => any

export interface ObjectPoolOptions {
  /**
   * 对象池大小
   * @default 20
   */
  size?: number
  /**
   * 超时时间(超过池子大小会等待后不会立即创建新的实例,而是等待已有实例释放)
   * @default 2000
   */
  timeout?: number
  /**
   * 轮询步长（当池子已满时使用）
   * @default 100
   */
  stepTime?: number
}
export type InstanceWithFree<T> = T & {
  /** 释放资源，原则上可以不释放然后一直独自享用 */
  free: () => void
}
export type InstanceWithStatus<T> = {
  /** 实例对象 */
  value: InstanceWithFree<T>
  /** 实例占用状况 */
  isUseing: boolean
}

export type ObjectKey = symbol | string | number

export type StateReturn<T> = T extends object
  ? {
      value: T
      set: (value: T) => void
      push: (key: ObjectKey, value: any) => void
    }
  : {
      value: T
      set: (value: T) => void
    }

import { Callback } from "./types"

export class EventBus<T extends Callback = Callback> {
  private eventMap: Record<string, T[]> = {}

  /**
   * 添加订阅
   * @param key
   * @param callBack
   */
  public addListen(key: string, callBack: T) {
    if (!this.eventMap[key]) {
      this.eventMap[key] = []
    }
    this.eventMap[key].push(callBack)
  }

  /**
   * 触发订阅
   * @param key
   * @param props
   */
  public trigger(key: string, ...props: Parameters<T>) {
    this.eventMap[key]?.forEach((callback) => callback(...props))
  }

  /**
   * 移除订阅
   * @param key
   * @param callBack
   */
  public remove(key: string, callBack: T) {
    this.eventMap[key] = this.eventMap[key]?.filter((cb) => cb !== callBack)
  }

  /**
   * 移除所有订阅
   * @param key
   */
  public clean(key: string) {
    this.eventMap[key] = []
  }
}

/**
 * 全局事件
 */
export const globalEvent = new EventBus()

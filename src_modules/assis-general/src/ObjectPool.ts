import { InstanceWithFree, InstanceWithStatus, ObjectPoolOptions } from './types'
import { getPromise } from './utils'


/**
 * 对象池
 */
export class ObjectPool<T extends object> {
  /**
   * 实例列表
   */
  instances: InstanceWithStatus<T>[]

  /** 对象池大小(单种类型) */
  size: number

  /** 超时时间 */
  timeout: number

  /** 步长 */
  stepTime: number

  constructor(
    protected instanceCreator: () => T,
    { size = 20, timeout = 2000, stepTime = 100 }: ObjectPoolOptions = {}
  ) {
    this.size = size
    this.timeout = timeout
    this.stepTime = stepTime
    this.instances = []
  }

  protected creatInstance() {
    // @ts-expect-error free 稍后赋值
    const instanceValue: InstanceWithFree<T> = this.instanceCreator()
    // 创建立马使用
    const instance = { value: instanceValue, isUseing: true }
    instanceValue.free = () => {
      instance.isUseing = false
    }
    this.instances.push(instance)
    return instance
  }

  /**
   * 获取实例，获取会立即占用实例，如果没有，会等待一定时间，如果超时，会抛出异常。
   * @description 获取则立即占用改实例, 使用完请释放，这样资源会回归到池子
   * @description 请调用instance.free 进行释放, 不释放则会一直占用
   * @description (可以先申请好,不释放达到单实例的使用方式)
   * @returns
   */
  getInstance() {
    const getExist = () => {
      for (const inst of this.instances) {
        if (!inst.isUseing) {
          inst.isUseing = true
          return inst.value
        }
      }
    }
    const inst = getExist()
    if (inst) {
      return Promise.resolve(inst)
    }
    if (this.instances.length < this.size) {
      return Promise.resolve(this.creatInstance().value)
    }
    const p = getPromise<InstanceWithFree<T>>()
    let times = 0
    const timeout = setInterval(() => {
      if (times * this.stepTime >= this.timeout) {
        clearInterval(timeout)
        p.reject('ObjectPool:获取实例等待超时')
        return
      }
      times += 1
      const inst = getExist()
      if (inst) {
        clearInterval(timeout)
        p.reslove(inst)
      }
    }, this.stepTime)
    return p.promise
  }
}

import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'
import { ExceptionOptions, ToastType } from './base/types'
/**
 * T|T[]
 */
export type OneMore<T> = T | Array<T>

/**
 * 概念
 */
export interface IConcept {
  /**
   * 父键: 存储概念名称
   */
  parent: string

  /**
   * 排序
   */
  seq?: number

  /**
   * 关系类型, 向后继节点衍生,直到定义了新的lineType
   */
  lineType?: string

  /**
   * 附加关系: 用于冗余非父子关系以外的其他关系
   * @example ```
   * "关系1:Target1","关系2:Target2","关系3:Target3"
   * ```
   */
  relations?: string

  /**
   * 线描述
   * @type "普通描述" | "(父=>子)关系,(子=>父)关系"
   */
  lineDesc?: string

  /**
   *概念名称
   */
  name: string

  /**
   * 唯一键
   */
  key?: string

  /**
   * 唯一标识符
   */
  unique?: string

  /**
   * 内容唯一键(和主键区分开,主键变化很快)
   */
  contentKey?: string

  /**
   * 简述
   */
  description?: string

  /**
   * 子键(意味着这是双向链路) 由think自行维护
   */
  children?: string[]

  /**
   * 可执行的 / 面相AI / 默认 false
   */
  executable?: boolean
}

/**
 * 概念内容
 */
export interface IConceptContent {
  /**
   * 唯一键
   */
  key: string
  /**
   * 完整描述
   */
  content: string
  /**
   * 由后续决定
   */
  [key: string]: any
}

/**
 * 包含内容的概念
 */
export interface IConceptWithContent extends IConcept {
  content?: IConceptContent
}

/**
 * 概念常量
 */
export enum ThinkConstant {
  Zero = '道',
  /**
   * 系统根节点
   */
  Root = '思想',
  /**
   * 关联
   */
  Relation = '关系',
  /**
   * 概念节点
   */
  Node = '概念',
  /**
   * 无根节点(游离节点)
   */
  Free = '',
  /**
   * 全局unique
   */
  GlobalUnique = '',
  /**
   * 空概念(有些概念没有名称,只是某某概念的某个属性)
   * @description 比如张三的儿子, 但是没有名字,但是张三的儿子已经很确定这个人了,或者可以更进一步: 张三的大儿子
   **/
  Null = 'Null'
}

// Think 类的类型声明
export interface IThink {
  /**
   * 获取键 (name在unique下唯一)
   * @param name 键名
   * @param unique (不允许包含@符号) 推荐uuid
   * @returns
   */
  getKey: (name: string, unique: string) => string

  /**
   * 获取键信息
   * @param key 键
   * @returns
   */
  getKeyInfo(key: string): { name: string; unique: string }

  /**
   * 分辨:写入(push/update)概念同名是会触发分辨(原则上不建议同名,但不同的unique下允许同名概念存在)
   * @param concepts [[source,...other],[source,...other]]
   * @returns 待概念列表: source[]
   */
  distinguish<T extends IConcept>(concepts: T[][]): Promise<T[] | void>

  /**
   * 获取概念详情
   * @param key
   */
  getConceptContentByKey(key: string): Promise<IConceptContent | void>
  getConceptContentByKey(keys: string[]): Promise<IConceptContent[] | void>

  /**
   * 获取概念
   * @param key 键
   * @returns
   */
  getConceptByKey(key: string): Promise<IConcept | void>
  getConceptByKey(keys: string[]): Promise<IConcept[] | void>

  /**
   * 获取概念(unique越匹配越优先) 模糊查询截止到这里
   * @param name 概念名称:精准匹配
   * @param option.withContent 默认false 是否搜索内容
   * @returns [Concept] 名称相同的前提下,第一个最匹配,最后一个为全局
   */
  getConceptsByName(
    name: string,
    option?: { withContent: boolean }
  ): Promise<IConceptWithContent[] | void>
  getConceptsByName(
    names: string[],
    option?: { withContent: boolean }
  ): Promise<IConceptWithContent[][] | void>

  /**
   * 获取指定键的视野
   */
  getKenByName(name: string, steps?: number, withContent?: boolean): Promise<IConcept[][] | void> // 根据实际情况定义视野类型
  /**
   * 仅获取自身和子节点，不反向衍生到父节点
   * @param name
   * @param steps
   */
  getTreeByName(
    name: string,
    steps?: number,
    withContent?: boolean
  ): Promise<IConceptWithContent[][] | void> // 根据实际情况定义视野类型

  /**
   * 获取根节点为Root的视野
   * @returns
   */
  getRootKen(steps?: number, withContent?: boolean): Promise<IConcept[][] | void> // 根据实际情况定义视野类型

  /**
   * 获取游离节点
   * @returns
   */
  getFreeConceptList(): Promise<IConcept[] | void>

  /**
   * 获取从指定节点到根节点`Root/Free`的链路
   */
  getConceptLinetoStartByName(name: string): Promise<IConcept[] | void> // 根据实际情况定义链路类型
  getConceptLinetoStartByName(name: string[]): Promise<IConcept[][] | void> // 根据实际情况定义链路类型

  /**
   * 根据名称搜索概念列表
   * @param name 名称模糊匹配
   */
  searchConceptListByName(name: string): Promise<IConcept[] | void>

  /**
   * 写入概念 当concepts.content存在时更新内容表concepts.content的key可以不传,以外部key为准
   * @param concepts
   * @returns key[]
   */
  pushConcept(...concepts: IConceptWithContent[]): Promise<string[] | void>

  // /**
  //  * 更新概念 当concepts.content存在时更新内容表concepts.content的key可以不传,以外部key为准// 怎么区分是更新还是新增
  //  * @param concepts
  //  */
  // updateConcept(...concepts: IConceptWithContent[]): Promise<string[] | void>

  /**
   * 删除概念|只要数据库不存在keys的任意key即为删除完成
   * @param names
   */
  deleteConcept(...names: string[]): Promise<void>

  /**
   * 删除概念及子节点
   * @param names
   */
  deleteConceptAndChildren(...names: string[]): Promise<void>

  /**
   * 获取关系列表
   */
  getRelationAllList(name: string): Promise<IConcept[] | void> // 根据实际情况定义关系类型
  getRelationAllList(names: string[]): Promise<IConcept[][] | void> // 根据实际情况定义关系类型

  /**
   * 获取关系列表, 仅获取当前节点的孩子节点
   */
  getRelationListByName(name: string): Promise<IConcept | void> // 根据实际情况定义关系类型
  getRelationListByName(names: string[]): Promise<IConcept[] | void> // 根据实际情况定义关系类型
  /**
   * 初始化
   */
  init: () => Promise<void>
}

export type ExceptionClass<E extends Error = Error> = {
  new(msg: string, options?: ExceptionOptions): E
}

/**
 * 思想
 */
export class Think<E> implements Partial<IThink> {
  /**
   * 获取一个唯一键
   * @returns
   */
  static getUniqueString() {
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

  /**概念常量 */
  static ThinkConstant = ThinkConstant

  constructor(protected Exception: ExceptionClass) { }

  /**
   * 获取键 (name在unique下唯一)
   * @param name 键名
   * @param unique (不允许包含@符号) 推荐uuid
   * @returns
   */
  getKey = (name: string, unique: string) => {
    if (!name) {
      throw new this.Exception('name is required', { type: ToastType.Error })
    }
    return `${encodeURIComponent(name)}@${unique}`
  }

  /**
   * 获取键信息
   * @param key 键
   * @returns
   */
  getKeyInfo = (key: string) => {
    const [name, unique] = key.split('@')
    return {
      name: decodeURIComponent(name),
      unique
    }
  }

  /**
   * 给节点追加childrenKeys 构造双向链路
   * @param concepts
   */
  protected addChildrenKeys<T extends IConcept>(concepts: T[], unique: string) {
    const conceptMap = new Map<string, Partial<T & { childSet: Set<string> }>>()

    // item用Name关联,key只管理唯一性

    for (const concept of concepts) {
      // 更新当前concept
      const key = this.getKey(concept.name, unique)
      const name = concept.name
      // 优先取已存在的Set(parent设置的)
      const childSet = conceptMap.get(name)?.childSet || new Set()
      concept.children?.forEach((name) => childSet.add(name))
      conceptMap.set(name, { ...concept, key, childSet })

      // 更新父节点.childSet
      const parentKey = this.getKey(concept.parent, unique)
      // 用Name为key键
      const parentName = concept.parent
      if (conceptMap.has(parentName)) {
        const parent = conceptMap.get(parentName)
        parent?.childSet?.add(name)
      } else {
        // 没有父节点,新建一个
        conceptMap.set(concept.parent, {
          key: parentKey,
          name: concept.parent,
          unique: unique,
          parent: Think.ThinkConstant.Free,
          childSet: new Set([name])
        } as any) // 类型识别有问题
      }
    }
    return Array.from(conceptMap.values()).map((concept) => {
      return {
        ...concept,
        children: concept.childSet ? Array.from(concept.childSet) : [],
        childSet: undefined
      } as unknown as T
    })
  }
}

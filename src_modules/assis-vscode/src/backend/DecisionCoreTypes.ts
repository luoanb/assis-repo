export interface IMsg {
  role: 'user' | 'assistant'
  content: string
  source?: any
}

export interface Result<T> {
  /**
   * 标识流式输出是否完成
   */
  isNotDone?: boolean
  /**
   * 是否成功
   */
  isSuccess: boolean
  /**
   * 提示
   */
  msg?: string
  /**
   * 数据
   */
  data?: T | null
}

/**
 * 模块类型
 */
export enum AssistantCoreType {
  ais = 'ais',
  actions = 'actions',
  record = 'record',
  eva = 'eva'
}

export interface AssistantCoreInstance {
  ais: InstanceAI
  actions: InstanceAction
  record: InstanceRecord
  eva: InstanceEvaluator
}

export interface Instance {
  /**
   * 关闭时调用,可为插件做销毁操作
   * @returns
   */
  off?: () => Promise<Result<boolean>>
}

export type InstanceAI = Instance & {
  coreType: AssistantCoreType.ais
  /** 解析 */
  determine?: (msgs: IMsg[]) => Promise<Result<IMsg>>
  /**
   * 流式解析
   * @param msgs
   * @returns
   */
  streamDetermine?: (msgs: IMsg[]) => AsyncGenerator<Result<any>, void, any>
  /**
   * 最大token数量
   */
  maxToken?: number
  /**
   * 计算token数量
   */
  getTokenNum?: (msgs: IMsg[]) => Promise<number>
}

export type InstanceAction = Instance & {
  /**
   * 描述
   */
  desc: string
  /**
   * 类型
   */
  coreType: AssistantCoreType.actions

  /** 解析 */
  run: (query: string) => Promise<Result<string>>
}

export type InstanceRecord = Instance & {
  coreType: AssistantCoreType.record
  /**
   * 提交
   * @param message
   * @returns
   */
  commit: (message: string) => Promise<Result<boolean>>
  /**
   * 测回
   * @returns
   */
  goback: () => Promise<Result<boolean>>
}

/**
 * 过滤参数
 */
export interface EVAFilterProps {
  startTime?: string
  endTime?: string
}

export interface EVAItem {
  /**
   * 类型
   */
  type: string
  /**
   * 事项
   */
  id: string
  /**
   * 是否停用启用
   */
  enable?: boolean
}
export interface EVAEvaluateProps extends EVAItem {
  /**
   * 评分0-100
   */
  score: number
  /**
   * 备注
   */
  remark?: string
}

/**
 * 反馈系统/评价系统
 */
export type InstanceEvaluator = Instance & {
  coreType: AssistantCoreType.eva
  /**
   * 给与评价
   * @param props
   * @returns
   */
  evaluate: (props: EVAEvaluateProps) => Promise<Result<boolean>>

  /**
   * 禁用(对以前评价过,现在却不能使用的记录使用)
   */
  disable: (type: string, id: string) => Promise<Result<boolean>>

  /**
   * 启用
   */
  enable: (type: string, id: string) => Promise<Result<boolean>>

  /**
   * 获取评级最高的记录
   * @param type 类型
   * @param filterProps 过滤
   */
  getBest(type: string, filterProps?: EVAFilterProps): Promise<Result<string>>

  /**
   * 获取评级最高的记录(可能会差不到,比如还未对该类型做过评价)
   * @param type 类型
   * @param ids 从ids中找最好的
   */
  getBest(type: string, ids: string[]): Promise<Result<string>>

  /**
   * 获取评价排行
   */
  getRankingList?: (type: string, filterProps?: EVAFilterProps) => Promise<Result<string[]>>
}

// { decisionCore: DecisionCore }
export interface DecisionPlugin<T extends Instance, Context = any> {
  /**
   * 类型
   */
  coreType: AssistantCoreType
  /** 唯一键 */
  id: string
  /** 名称 */
  name: string
  /** 工具的描述 */
  desc: string
  /** 获取实例, 确保每个实例可并行运行,互补干扰 */
  getInstance: (context: Context) => T
}

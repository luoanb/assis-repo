import { InstanceWithFree, ObjectPoolOptions } from "assis-general";
import { gloabalStore } from "assis-general";
// import { getConfig } from '@/base/serve/vscode'
import { ObjectPool } from "assis-general";
import {
  AssistantCoreInstance,
  AssistantCoreType,
  DecisionPlugin,
  InstanceAI,
  InstanceAction,
  InstanceEvaluator,
  InstanceRecord,
  Result,
} from "./DecisionCoreTypes";

/**
 * 决策系统核心:声明插件时注意: 需要允许重复初始化
 */
export class DecisionCore {
  constructor(private option: ObjectPoolOptions = {}) {}
  /**
   * 智能系统
   */
  readonly ais = gloabalStore.createState<
    Record<string, DecisionPlugin<InstanceAI, { decisionCore: DecisionCore }>>
  >({});
  /**
   * 执行系统
   */
  readonly actions = gloabalStore.createState<
    Record<
      string,
      DecisionPlugin<InstanceAction, { decisionCore: DecisionCore }>
    >
  >({});
  /**
   * 记录系统
   */
  readonly record = gloabalStore.createState<
    Record<
      string,
      DecisionPlugin<InstanceRecord, { decisionCore: DecisionCore }>
    >
  >({});
  /**
   * 评价系统
   */
  readonly eva = gloabalStore.createState<
    Record<
      string,
      DecisionPlugin<InstanceEvaluator, { decisionCore: DecisionCore }>
    >
  >({});

  private allInstances: Record<string, any> = {};

  /**
   * 根据类型和id获取实例(用于支持并发，同时相应流式请求)
   * @param type
   * @param id
   * @returns
   */
  async getInstanceByTypeAndID<T extends AssistantCoreType>(
    type: T,
    id: string
  ) {
    const key = `${type}-${id}`;
    if (!this.allInstances[key]) {
      this.allInstances[key] = new ObjectPool(
        () =>
          this.allInstanceCreator[type]?.value?.[id].getInstance({
            decisionCore: this,
          }),
        this.option
      );
    }
    return (await this.allInstances[key].getInstance()) as InstanceWithFree<
      AssistantCoreInstance[T]
    >;
  }

  private readonly allInstanceCreator = {
    ais: this.ais,
    actions: this.actions,
    record: this.record,
    eva: this.eva,
  };

  static createSuccessResult<T>(value: T, isNotDone = false) {
    return {
      isNotDone,
      isSuccess: true,
      data: value,
    } as Result<T>;
  }

  static createErrorResult(msg: string) {
    return {
      isSuccess: false,
      data: null,
      msg,
    } as Result<null>;
  }
  // /**
  //  * 获取配置信息 workspace/.assis.json
  //  */
  // getConfig = getConfig

  createSuccessResult = DecisionCore.createSuccessResult;
  createErrorResult = DecisionCore.createErrorResult;
  /**
   * 添加实例
   * @param instances
   */
  pushInstance(...instances: DecisionPlugin<any>[]) {
    try {
      let res = instances.map(async (inst) => {
        this.allInstanceCreator[inst.coreType]?.push(inst.id, inst);
        return this.createSuccessResult(true);
      });
      return Promise.all(res);
    } catch (error) {
      return [this.createErrorResult(error as any)];
    }
  }
}

/**
 * 内研和外设插件
 * AI内部自动衍生到极致(Tree可多枝)(如何衍生很重要,决定衍生质量)
 * 衍生完成后交由action处理(可以通知人工处理, 可以交由其他外设处理)
 */

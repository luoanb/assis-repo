import { createUniqueString } from "assis-general";
import { IMsg } from "./DecisionCoreTypes";

export type IAIProcessResult = {
  /** 导出历史给下一个节点继承使用--取决于默认设置prompt.exportHistory */
  msgs: IMsg[];
  /**
   * md
   */
  content: string;
  /**
   * json
   */
  computerContent?: string;
  [key: string]: any;
};

export interface IAIProcess {
  id: string;
  propmtId: string;

  result: IAIProcessResult;
}

export interface IAITask {
  id: string;
  name: string;
  process: IAIProcess[];
  isRunning: boolean;
}

export class AITaskTools {
  /**
   * 创建
   * @param name
   * @returns
   */
  static createAITask = (name: string) => {
    return {
      id: createUniqueString(),
      name: name,
      process: [],
      isRunning: false,
    };
  };
  /**
   * 创建
   * @param name
   * @returns
   */
  static createAIProcess = (propmtId: string) => {
    return {
      id: createUniqueString(),
      propmtId,
      result: {
        content: "",
        msgs: [] as IMsg[],
      },
    } as IAIProcess;
  };
}

export type AITasks = Record<string, IAITask>;

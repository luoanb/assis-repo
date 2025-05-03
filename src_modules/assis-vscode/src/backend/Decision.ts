import { Low } from "cjs-lowdb";
import { InstanceWithFree } from "assis-general";
import { createUniqueString } from "assis-general";
import { DecisionCore } from "./DecisionCore";
import { AssistantCoreType, IMsg, InstanceAI } from "./DecisionCoreTypes";
import { IThink } from "./Think";
import { QianfanPlugin } from "./ais/qianfan";
import { ShellPlugin } from "./actions/shell";
// import data from "./data.json"
import { AITasks, AITaskTools, IAITask } from "./AITaskTools";
import { MsgTools } from "./MsgTools";
import path from "path";
import process from "process";
import { readFileAsString } from "./base";
import DataBase from "./data.json";
import { get } from "http";

type IData = (typeof DataBase)["propmts"];

// 人类拥有的智慧不是个人的智慧, 而是集体的智慧
// 人类的认知是可塑的, 允许我们不断学习, 更新(也就是认知一直是有误的,如同线性回归一般)
// 如何人类简史中描述的虚拟故事, 由于不像蚂蚁那样把合作的基因刻入DNA, 所有人类的行为总是在犯错, 然后纠偏.
// 人工智能其实也在重复这个过程(不过他的纠偏是由人类去干预的, 这对它而言可以更快地收敛, 因为人类是知道答案的)

/**
 * @desc 结构化和非结构化融合统一
 * @desc 上下文处处留痕, 所有步骤可查可复现
 * @desc 需要考虑的只是留痕在什么位置合适
 */
export class Decision {
  constructor(
    /**
     * 决策引擎
     */
    public decisionCore: DecisionCore,
    /**
     * 思维树(tree形存储)
     */
    public think: IThink,
    /**
     * 缓存内容到工作工作目录
     */
    public useWorkspaceLowDB: <T>(
      fileName: string,
      defaultValue: T
    ) => Promise<Low<T>>
  ) {
    this.decisionCore.pushInstance(QianfanPlugin, ShellPlugin);
  }

  /**
   * 存储任务
   * @returns
   */
  useAITaskDB = async () => {
    return await this.useWorkspaceLowDB("aiTask.json", {} as AITasks);
  };

  /**
   * 缓存聊天历史记录
   * @returns
   */
  useChatList = async (fileName = "chatList") => {
    let db = await this.useWorkspaceLowDB(fileName + ".json", {
      messages: [] as any[],
    });
    const push = (...msgs: IMsg[]) => {
      db.update((data) => {
        if (!data.messages) {
          data.messages = msgs;
        } else {
          data.messages.push(...msgs);
        }
      });
    };
    return {
      db,
      push,
    };
  };
  /**
   * 获取一个uuid
   */
  getUniqueString = createUniqueString;
  /**
   * 执行
   */
  async exec(id: string, commond: string) {
    const action = await this.decisionCore.getInstanceByTypeAndID(
      AssistantCoreType.actions,
      id
    );
    return action.run(commond);
  }

  // /**
  //  * 执行前摇，确认执行器和执行指令/ 非结构化转为结构化 指定的思考
  //  */
  // async beforeExec(value: string) {
  //   return [{ id: '1', commond: '1' }]
  // }

  // /**
  //  * @desc 执行后摇, 整理执行的结果（作为上下文存储起来）
  //  * @desc 跳转的下一个任务（子任务优先），没有再跳转到同级任务

  //  */
  // async afterExec(list: any[]) {
  //   // TODO Prompt 对结果进行处理
  // }

  getMsgByAnswer(answer: string) {
    const msg: IMsg = { role: "user", content: answer };
    return msg;
  }

  /**
   *  任务系统说明
   *  给一个任务系统的propmt队列,每一个prompt的对话独立
   *  一起循环之后, 应该可以细化当前任务为一些具体的子任务
   *  然后对子任务再进行prompt队列再细化, 直到任务是计算机可执行的任务或者不可能完成的任务为止
   *  队列的上一个输出作为下一个的输入(没有输出时直接以问题作为输入)
   */

  /**
   * 获取历史任务
   * @param taskId
   * @returns
   */
  async getTaskHistory() {
    const Taskdb = await this.useAITaskDB();
    const task = Taskdb.data;
    return task;
  }

  //////////////////////////////////////////
  // 这里的概念仅衍生到任务, 或者说项目
  // 如果需要更智能, 应该要更一步衍生到助手, 也就是人的概念, 自我(存储)
  //////////////////////////////////////////
  /**
   * 思考与执行
   */
  async taskExec({ input = "", taskId = "", propmtId = "" }) {
    /**
     * 任务db
     */
    const Taskdb = await this.useAITaskDB();
    /**
     * 是否是新任务 todo 默认给true/以后需要改
     */
    let isNewTask = true;
    /**
     * 当前任务
     */
    let task: IAITask;
    if (taskId && Taskdb.data[taskId]) {
      task = Taskdb.data[taskId];
    } else {
      isNewTask = true;
      task = AITaskTools.createAITask(input);
    }

    // todo 历史任务继续等问题比较复杂, 先不管

    // let msgs: IMsg[] = []
    // if (task.process.length) {
    //   let lastProcess = task.process[task.process.length - 1]
    //   msgs = lastProcess.result.msgs
    // }

    // 开放和收束的环节

    // msgs.push(MsgTools.createUserMsg())

    // todo 指定具体propmt入口

    // 如何处理多分支结构-->childrenType
    // const fristIndex = 0
    // let index = fristIndex
    const rootId = "0";

    let currentId: string | null = rootId;
    const data = JSON.parse(
      await readFileAsString(
        path.join(
          "E:/workspace/assistant-repo/assistant-core/src/v1/backend",
          "./data.json"
        )
      )
    );
    while (true) {
      /////////////////////////////
      ///准备阶段
      ////////////////////////////
      let msgs: IMsg[] = [];
      // 初始化propmt
      const prompts: IData = data.propmts;
      const item = prompts.find((it) => it.id == currentId);
      if (!item) {
        throw new Error("propmt not found");
      }
      const newProcess = AITaskTools.createAIProcess(item.id);
      let children = prompts.filter((it) => it.parentId == currentId);
      let content = "";
      let selectedId = null;
      let userInput = "";

      /**
       * 把子节点信息注入到prompt中
       * @param centent
       * @returns
       */
      const replaceChildContent = (centent: string) => {
        return centent.replace("{{0}}", () => {
          return children.map((it, index) => `${index}. ${it.desc}`).join("\n");
        });
      };

      /**
       * 用户信息注入模板
       * @param centent
       * @returns
       */
      const replaceUserInput = (centent: string) => {
        return centent.replace("{{1}}", () => {
          return `'${userInput}'`;
        });
      };
      ////////////////////////////
      //// 业务阶段
      ////////////////////////////

      // (1) 多回合对话模式(问题和prompt合并在一起): 容易突破预设prompt限制,得不到准确回答
      if (!item.doImmediately) {
        // (1.1) 多分支选择: 回合制修复过的prompt效果更明显
        if (item.msgsContent?.length) {
          msgs.push(
            ...item.msgsContent.map((it) => {
              return {
                // @ts-expect-error
                ...it,
                content: replaceChildContent(it.content),
              };
            })
          );
        }
        // (1.2) 多分支选择: 单prompt
        else {
          // 处理prompt
          let promptMsg = item.content;
          // 多分支触发选择
          if (children?.length > 1) {
            promptMsg = replaceChildContent(item.content);
          }
          // 提交给大模型
          msgs.push(MsgTools.createUserMsg(promptMsg));
          let result = await this.determine2(msgs);
          // console.log("----result:", result);
          msgs.push(result?.data || MsgTools.createSystemMsg(""));
        }

        // 处理业务数据
        if (currentId == rootId) {
          userInput = input;
        } else {
          let lastProcess = task.process[task.process.length - 1]; // 最后一个
          userInput = lastProcess.result.content;
        }
        msgs.push(MsgTools.createUserMsg(`"${userInput}"`));
      }
      // (2) 单轮模式(问题和prompt合并在一起)
      else {
        // 处理业务数据
        if (currentId == rootId) {
          userInput = input;
        } else {
          let lastProcess = task.process[task.process.length - 1]; // 最后一个
          userInput = lastProcess.result.content;
        }
        msgs.push(
          MsgTools.createUserMsg(
            replaceUserInput(replaceChildContent(item.content))
          )
        );
      }

      let result = await this.determine2(msgs);
      console.log("----result2:", result);
      msgs.push(result?.data || MsgTools.createSystemMsg(""));

      content = result?.data?.content || "";
      selectedId = null;
      // 只做选择, 未解析用户具体内容 问题原样返回
      if (children.length > 1) {
        let index = -1;
        try {
          index = parseInt(result?.data?.content || "");
        } catch (error) {}
        content = userInput;
        selectedId = children[index]?.id || null;
      } else if (children.length === 1) {
        selectedId = children[0].id;
      }

      // 保存结果
      newProcess.result = {
        question: msgs[0]?.content,
        result: msgs[msgs.length - 1]?.content,
        content,
        selectedId, // 缓存一下选择记录
        msgs: item.exportHistory ? msgs : [],
      };
      task.process.push(newProcess);

      // 存储到db
      Taskdb.update((data) => {
        data[task.id] = task;
      });

      currentId = selectedId;

      if (!currentId) {
        break;
      }
    }
  }

  /**
   * 思考/决策
   */
  ponder(msgs: IMsg[]) {
    return this.determine2(msgs);
  }

  /**
   * 获取评分最好的AI
   * @returns
   */
  protected async getBestAI(): Promise<InstanceWithFree<InstanceAI> | null> {
    const defaultId = QianfanPlugin.id;
    return await this.decisionCore.getInstanceByTypeAndID(
      AssistantCoreType.ais,
      defaultId
    );
  }

  /**
   * AI 解析内容(优先流式响应)
   * @param msgs
   * @returns
   */
  async *determine(msgs: IMsg[]) {
    try {
      const ai = await this.getBestAI();
      if (ai) {
        if (ai.streamDetermine) {
          for await (const res of ai.streamDetermine(msgs)) {
            yield res;
          }
          ai.free();
        } else {
          yield await ai.determine?.(msgs);
          ai.free();
        }
      } else {
        return this.decisionCore.createErrorResult(
          "未找到AI解析器,请确认是否已注册AI"
        );
      }
    } catch (error) {
      console.warn("determine:err", error);
      return this.decisionCore.createErrorResult("出现异常");
    }
  }

  /**
   * AI 解析内容 非流式
   * @param msgs
   * @returns
   */
  async determine2(msgs: IMsg[]) {
    try {
      const ai = await this.getBestAI();
      if (ai) {
        const res = await ai.determine?.(msgs);
        ai.free();
        return res;
      } else {
        return this.decisionCore.createErrorResult(
          "未找到AI解析器,请确认是否已注册AI"
        );
      }
    } catch (error) {
      console.warn("determine:err", error);
      return this.decisionCore.createErrorResult("出现异常");
    }
  }
}

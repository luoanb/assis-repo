import { getPromise } from "assis-general";
import {
  AssistantCoreType,
  DecisionPlugin,
  InstanceAction,
  Result,
} from "../DecisionCoreTypes";
import { exec } from "child_process";
class Shell implements InstanceAction {
  desc = "调用电脑shell执行具体的指令";
  readonly coreType = AssistantCoreType.actions;
  id = "shell";
  name = "Shell";
  async run(cmdstr: string) {
    const p = getPromise<Result<string>>();
    exec(cmdstr, { encoding: "utf8" }, (error, stdout, stderr) => {
      if (error) {
        p.reslove({ isSuccess: false, msg: `执行错误: ${cmdstr}` });
        return;
      }
      p.reslove({ isSuccess: true, data: stdout });
    });
    return await p.promise;
  }
}

export const ShellPlugin: DecisionPlugin<InstanceAction> = {
  coreType: AssistantCoreType.actions,
  id: "shell",
  name: "Shell",
  /** 需要一个游标概念:明确执行时的上下文(或者是具体的工作区), 注释需要流转在程序内部, 不在只是给人看的内容, AI也需要看 */
  desc: "在电脑上执行shell指令, 可运行的指令由电脑的系统和已安装的命令决定;工作路径:需要精确到具体的文件夹或文件",
  getInstance: (context) => {
    return new Shell();
  },
};

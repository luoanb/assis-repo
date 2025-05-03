import { AssistantCoreType, DecisionPlugin, InstanceAction } from "../DecisionCoreTypes"

export const getToastPlugin: (toast: any) => DecisionPlugin<InstanceAction> = (toast:any) => {
  return {
    coreType: AssistantCoreType.actions,
    id: 'toast',
    name: 'toast',
    /** 需要一个游标概念:明确执行时的上下文(或者是具体的工作区), 注释需要流转在程序内部, 不在只是给人看的内容, AI也需要看 */
    desc: "在用户无法识别的场景下,发送通知给用户,转由用户确认",
    getInstance: (context) => {
      return {
        coreType: AssistantCoreType.actions,
        desc: '',
        run: async (query) => {
          return await toast?.(query)
        }
      }
    }
  }
  
}

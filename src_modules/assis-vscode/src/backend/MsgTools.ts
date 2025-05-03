import { IMsg } from "./DecisionCoreTypes";

export class MsgTools {
  static createSystemMsg = (content: string, source?: any) => ({
    role: 'assistant',
    source,
    content
  }) as IMsg

  static createUserMsg = (content: string) => ({
    role: 'user',
    content
  }) as IMsg
}
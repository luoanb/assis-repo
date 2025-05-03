import { proxy } from 'valtio'
export type FeedbackItem = Partial<{
  id: string
  /**
   * 待反馈任务id
   */
  url: string
  /**
   * 标题
   */
  title?: string
  /**
   * 详细描述
   */
  infomation: string
  /**
   * 帮助文本
   */
  helpText: string
  /**
   * 状态/原样返回
   */
  state: string
}>

function feedbackCreator() {
  const state = proxy({
    feedback: [] as FeedbackItem[]
  })
  /**
   * 处理完该事项
   * @param index
   */
  const resolve = (index: number) => {
    state.feedback = state.feedback.filter((_, i) => i !== index)
  }
  const getDataByNet = () => {
    // return state.feedback
  }
  return {
    state,
    getDataByNet,
    addFeedback(item: FeedbackItem) {
      state.feedback = [item].concat(state.feedback)
    },
    clearFeedback() {
      state.feedback = []
    },
    resolve
  }
}
export const feedbackStore = feedbackCreator()

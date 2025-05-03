import * as front from '@/utils/vscodeFrontend'
import { EventBus } from '@/utils/event'
export type SocketEventCallback = (data: { type: string; data: any }) => void

export const socketCreator = () => {
  const socketEvent = new EventBus<SocketEventCallback>()

  const init = () => {
    /**
     * 监听长连接
     */
    front.socketRequest('/socket', (res) => {
      const type = res.data.type
      socketEvent.trigger(type, res.data)
    })
    const vscode = front.getVscodeInstance()
    vscode.postMessage({
      url: 'inited',
      data: null
    })
  }
  return {
    init,
    socketEvent
  }
}

export const socket = socketCreator()

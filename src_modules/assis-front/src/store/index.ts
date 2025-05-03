// export * from './dashboard'
import { proxy } from 'valtio'

/**
 * 工作区状态
 */
export interface WorkStation {
  path?: string
  file?: string
  select?: { context: string; position: any } | null
  isUse?: boolean
}

const createDashStore = () => {
  const dialog = proxy({
    isOpen: false
  })
  const work = proxy({
    workStation: null as WorkStation | null
  })

  const setWorkStation = (workStation: WorkStation | null) => {
    work.workStation = workStation
  }

  const setIsOpen = (isOpen: boolean) => {
    dialog.isOpen = isOpen
  }
  return { dialog, setIsOpen, work, setWorkStation }
}
export const dashStore = createDashStore()

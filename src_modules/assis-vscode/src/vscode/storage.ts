import * as vscode from 'vscode'

const createStorage = () => {
  const Name = 'assistant-ai'
  const key = 'globalState'
  const state: Record<string, any> = vscode.workspace.getConfiguration(Name).get(key) || {}
  return {
    get: (key: string,): any | null => {
      const value = state[key]
      return value
    },
    set: (key: string, val: any) => {
      state[key] = val
      vscode.workspace.getConfiguration(Name).update(key, state, true)
    },
    rm: (key: string) => {
      delete state[key]
      vscode.workspace.getConfiguration(Name).update(key, state, true)
    }
  }
}

export const storage = createStorage()
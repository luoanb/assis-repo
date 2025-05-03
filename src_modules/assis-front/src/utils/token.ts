import { storage } from './storage'

const TOKEN_KEY = 'TOKEN_KEY'

const USER_INFO = 'USER_INFO'

import { storageLocal } from './storageLocal'
import { globalEvent } from './event'
const TOKEN_CHANGE_EVENT = 'TOKEN_CHANGE_EVENT'
// globalEvent.
export const token = {
  /**
   * 首页路径
   */
  INDEX_PAGE: '/taxation',
  /**
   * 登录页
   */
  LOGIN_PAGE: '/login',

  /** 取token */
  get() {
    return storageLocal.get(TOKEN_KEY)
  },
  /**
   * 设置token
   * @param value
   * @returns
   */
  set(value: string) {
    globalEvent.trigger(TOKEN_CHANGE_EVENT, value)
    return storageLocal.set(TOKEN_KEY, value)
  },
  /**
   * 设置用户信息
   * @param value
   * @returns
   */
  setUserInfo(value: any) {
    return storageLocal.set(USER_INFO, value)
  },
  /**
   * 取用户信息
   */
  getUserInfo() {
    return storageLocal.get(USER_INFO)
  },

  /**
   * 清除登录信息
   */
  clean() {
    this.set('')
    this.setUserInfo(null)
    globalEvent.trigger(TOKEN_CHANGE_EVENT, '')
  },
  onTokenChange(cb: (token: string) => void) {
    globalEvent.addListen(TOKEN_CHANGE_EVENT, cb)
  }
}

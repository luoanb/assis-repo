import { BASE_URL } from '@/config'
import { message } from 'antd'
import { token } from '@/utils/token'
import router from '@/router'
import { createDebounce } from '@/hooks'
interface ICreateHttpProps {
  /**
   * 自动解析json (当处理文件等特殊请求时关闭)
   * @default true
   */
  autoJsonParse?: boolean
  /**
   * 错误自动提醒 (前置需要开启autoJsonParse)
   * @default true
   */
  autoErrorTip?: boolean
  header?: any
}

/**
 * 防抖执行跳转登录
 */
const deLogin = createDebounce((json) => {
  if (json.code == 4001) {
    router.navigate(token.LOGIN_PAGE)
  }
}, 1000)

export const createHttp = ({
  autoErrorTip = true,
  autoJsonParse = true,
  header = {}
}: ICreateHttpProps = {}) => {
  const myFetch = async (url: RequestInfo, init?: RequestInit) => {
    try {
      const res = await fetch(`${BASE_URL}${url}`, {
        ...init,
        headers: {
          saToken: token.get(),
          Timestamp: new Date().getTime().toString(),
          ...header
        }
      })
      if (autoJsonParse) {
        const json = await res.json()
        deLogin(json)
        if (autoErrorTip) {
          // 错误自动提醒
          if (!json.success) {
            message.error(json.message)
          }
        }
        return json
      }
      return res
    } catch (error: any) {
      console.warn('http:error:', error)

      const data: any = {
        code: 403,
        message: '系统异常',
        result: null,
        success: false
      }
      if (error.message === 'Failed to fetch') {
        data.message = '网络连接超时'
      }

      if (autoJsonParse) {
        // 错误自动提醒
        if (autoErrorTip) {
          message.error(data.message)
        }
        return data
      }

      const errRes = new Response(JSON.stringify(data), { status: 403 })
      return errRes
    }
  }
  return {
    fetch: myFetch
  }
}

/**
 * 常规请求
 */
export const http = createHttp({ header: { 'Content-Type': 'application/json' } })

/**
 * 文件等特殊请求
 */
export const formDataHttp = createHttp()

/**
 * sse 功能封装
 */
export const sseHttp = null

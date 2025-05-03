import { useState } from "react"

export type HttpFunction = () => Promise<any>
/**
 * 执行后端请求:封装了loading
 * @param callback 
 * @returns 
 */
export const useExec = <T extends HttpFunction = HttpFunction>(callback: T,) => {
  const [isLoading, setIsLoading] = useState(false)
  const exec = async () => {
    try {
      setIsLoading(true)
      const res = await callback()
      setIsLoading(false)
      return res
    } catch (error) {
      setIsLoading(false)
      throw error
    }
  }

  return {
    isLoading,
    exec
  }
}
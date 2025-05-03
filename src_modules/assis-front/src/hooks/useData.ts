import { RequestOptions } from "@/api/request"
import { useEffect, useState } from "react"

export type HttpFunction = (body: any, options?: RequestOptions) => Promise<any>
export const useData = <T extends HttpFunction = HttpFunction>(callback: T,) => {
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<ReturnType<T> | null>(null)
  const exec = async (...args: Parameters<T>) => {
    try {
      setIsLoading(true)
      // @ts-expect-error
      const res = await callback(...args)
      setData(res)
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
      // setData(null)
    }
  }

  return {
    isLoading,
    data,
    exec
  }
}
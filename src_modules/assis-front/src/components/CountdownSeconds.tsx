import React, { useEffect, useState } from 'react'

/**
 * 倒计时组件参数
 */
export interface CountdownSeconds extends React.HTMLAttributes<HTMLSpanElement> {
  initialSeconds: number
  /**
   * 倒计时结束执行回调
   * @returns
   */
  timeEnd: () => void
  /**
   * 展示提醒:默认:剩余：{value} 秒
   * @param value 剩余秒数
   * @returns
   */
  msg?: (value: number) => React.ReactNode
}
/**
 * 倒计时组件参数
 * @param props
 * @returns
 */
const CountdownSeconds = ({
  initialSeconds,
  timeEnd,
  className = '',
  msg = (value) => `${value} 秒后可重新获取验证码`,
  ...props
}: CountdownSeconds) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds)

  useEffect(() => {
    const interval = setInterval(() => {
      if (secondsLeft > 0) {
        const time = secondsLeft - 1
        setSecondsLeft(time)
      } else {
        timeEnd()
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval) // 清除定时器，防止内存泄漏
  }, [secondsLeft])

  return (
    <span {...props} className={`text-gray-400 ` + className}>
      {msg(secondsLeft)}
    </span>
  )
}
export default CountdownSeconds

import React, { CSSProperties, useEffect, useRef } from 'react'

export interface CharInputsProps {
  /**
   * 长度
   * @default 6
   */
  charLength?: number
  /**
   * 输入字符
   */
  value: string
  /**
   * 输入值改变
   * @param value
   * @returns
   */
  onChange: (value: string) => void
  /**
   * 输入完成回调
   * @param value
   * @returns
   */
  onComplate?: (value: string) => void
  /** 错误 */
  isInvalid?: boolean
  /** 错误提示 */
  errorMessage?: React.ReactNode
  /** 触发清理错误 */
  clearError?: () => void
}

/**
 * 替换指定位置的字符
 * @param str
 * @param position
 * @param newChar
 * @returns
 */
function replaceCharAtPosition(str: string, position: number, newChar: string): string {
  // 检查位置是否有效
  if (position < 0) {
    throw new Error(`Invalid position str:${str} position:${position}`)
  }
  if (position > str.length) {
    return str + newChar.padStart(position + 1 - str.length, ' ')
  }
  // 使用字符串的 slice 方法来创建新的字符串
  // slice 方法会返回一个新的字符串对象，包含从开始到结束（不包括结束）选择的、由原字符串的浅拷贝构成的一部分。
  // 原始字符串不会被改变。
  return str.slice(0, position) + newChar + str.slice(position + 1)
}

const replaceAll = (value: string, search: string, replace: string) => {
  return (value || '').split(search).join(replace)
}

/**
 * 短信验证码输入框
 */
export default function CharInputs({
  value,
  onChange,
  onComplate,
  isInvalid,
  errorMessage,
  clearError,
  charLength = 6
}: CharInputsProps) {
  const inputBox = useRef<HTMLDivElement>(null)
  const chars = new Array(charLength).fill('').map((_v, i) => value[i] || '')
  const style: CSSProperties = {
    width: '36px',
    height: '38px',
    background: '#F0F1F4',
    borderRadius: '10px',
    border: isInvalid ? '2px solid rgb(239 68 68)' : ''
  }

  /**
   * 判断当输入完成时执行onComplate
   * @param newValue
   */
  const doComplate = (newValue: string) => {
    if (newValue.replace(' ', '').length == charLength) {
      onComplate?.(newValue)
    }
  }

  useEffect(() => {
    doComplate(value)
    if (value.length == 0) {
      setTimeout(() => {
        inputBox.current?.querySelectorAll('input').item(0)?.focus()
      }, 100)
    }
  }, [value])

  const setFocusInput = (index: number) => {
    inputBox.current?.querySelectorAll('input').item(index)?.focus()
  }

  return (
    <>
      <div className="flex" ref={inputBox}>
        {chars.map((char, index) => (
          <input
            key={index + char}
            autoComplete="new-password"
            style={style}
            value={char}
            onFocus={(e) => {
              setTimeout(() => {
                e.target.setSelectionRange(e.target.value?.length, e.target.value?.length)
              }, 50)
            }}
            onPaste={async () => {
              const text = (await navigator.clipboard.readText()).substring(0, 6)
              onChange(text.substring(0, 6))
            }}
            onChange={(e) => {
              const newChar = e.target.value?.[e.target.value.length - 1] || ' '
              const newValue = replaceCharAtPosition(value, index, newChar)
              onChange(newValue)
            }}
            onKeyDown={(e) => {
              // @ts-expect-error 有value
              const cuValue = replaceAll(e.target.value, ' ', '')
              clearError?.()
              setTimeout(() => {
                const beforeKeys = ['ArrowLeft', 'ArrowUp']
                const cuindex = Math.max(0, index - 1)
                if (beforeKeys.includes(e.key)) {
                  setFocusInput(cuindex)
                } else if (e.key == 'Backspace') {
                  console.log('e.target.value', cuValue, index, cuindex)
                  if (!cuValue?.length) {
                    setFocusInput(cuindex)
                  } else {
                    setFocusInput(index)
                  }
                } else {
                  const cu2Index = Math.min(index + 1, charLength - 1)
                  setFocusInput(cu2Index)
                }
              }, 50)
            }}
            className="mr-2 text-center"
          />
        ))}
      </div>
      {isInvalid ? <div className="text-sm mt-4 text-red-500">{errorMessage}</div> : null}
    </>
  )
}

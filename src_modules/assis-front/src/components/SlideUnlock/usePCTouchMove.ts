import { createThrottle } from '@/hooks/useDebounce'
import { proxy } from 'valtio'

const defaultValue = { x: 0, y: 0, isMove: false }

type DoneCallback = (state: typeof defaultValue, boxWidth: number, e: any) => void
/**
 * 处理拖拽滑动
 * @description 由于useState 在 document.addEventListener中无法实时更新，采用状态管理保存状态
 * @returns
 */
export const createPCTouchMove = () => {
  /**
   * 拖动位置存储
   */
  const posi = proxy(defaultValue)

  /**
   * 拖动完成回调存储
   */
  let doneCallback: DoneCallback
  /**
   * 拖动完成
   */
  const onTouchDone = (callback: DoneCallback) => {
    doneCallback = callback
  }
  /**
   * 拖动开启位置记录
   */
  const startEventRef = proxy({ x: 0, y: 0 })
  /**
   * 拖动区域宽度
   */
  let boxWidth = 0

  /**
   * 状态赋值
   * @param value
   */
  const setValue = (value: Partial<typeof defaultValue>) => {
    Object.keys(value).forEach((key) => {
      // @ts-ignore
      posi[key] = value[key]
    })
  }

  /**
   * 设置拖动位置 x,限制了取值范围
   * @param x
   */
  const setX = (x: number) => {
    let val = Math.max(0, x)
    val = Math.min(val, boxWidth)
    posi.x = val
  }

  const onMouseMove = createThrottle((e) => {
    if (posi.isMove) {
      if (startEventRef) {
        setX(e.screenX - startEventRef.x)
        posi.y = e.screenY - startEventRef.y
      }
    }
  }, 10)

  const onMouseUp = (e: any) => {
    posi.isMove = false
    document.removeEventListener('mouseup', onMouseUp)
    document.removeEventListener('mousemove', onMouseMove)

    doneCallback?.(posi, boxWidth, e)
  }
  const onMouseDown = (e: any, boxRef: React.RefObject<HTMLDivElement>) => {
    e.preventDefault()
    startEventRef.x = e.screenX
    startEventRef.y = e.screenY
    posi.isMove = true
    // boxWidth = boxRef.current?.offsetWidth || 0
    if (boxRef.current?.offsetWidth) {
      boxWidth = boxRef.current?.offsetWidth - e.currentTarget.offsetWidth
    }

    document.addEventListener('mouseup', onMouseUp)
    document.addEventListener('mousemove', onMouseMove)
  }
  return {
    state: posi,
    onMouseDown,
    onTouchDone,
    setValue,
    setX
  }
}

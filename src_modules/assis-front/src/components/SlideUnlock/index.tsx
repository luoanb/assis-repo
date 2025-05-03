import moverightIcon from '@/assets/login-moveright.svg'
import { createPCTouchMove } from './usePCTouchMove'
import { useSnapshot } from 'valtio'
import { useEffect, useRef } from 'react'

export interface SlideUnlockProps {
  className?: string
}

const touchMove = createPCTouchMove()

/**
 * 滑动解锁
 * @returns
 */
export const SlideUnlock = ({ className }: SlideUnlockProps = {}) => {
  const slideBox = useRef<HTMLDivElement>(null)
  const state = useSnapshot(touchMove.state)
  useEffect(() => {
    touchMove.onTouchDone((state, boxWidth) => {
      console.log(state, boxWidth)
      if (state.x < boxWidth) {
        touchMove.setX(0)
      }
    })
  }, [])
  return (
    <div
      ref={slideBox}
      className={`relative w-100 bg-gray-100 rounded-md ${className} items-center justify-center flex`}
      style={{ height: '2.75rem', paddingLeft: '2.6875rem' }}
    >
      <div
        className="absolute rounded-md left-0 top-0 h-100 bg-success border-2"
        style={{ width: state.x + 10 }}
      ></div>
      <div
        className="absolute  left-0 top-0 h-100 rounded-md border-gray-100 border-2 bg-white flex justify-center items-center cursor-pointer"
        style={{
          width: '2.6875rem',
          left: state.x
        }}
        onMouseDown={(e) => touchMove.onMouseDown(e, slideBox)}
      >
        <img src={moverightIcon} alt="" />
      </div>
      <p className="text-gray-400">请按住滑块，拖向右边</p>
    </div>
  )
}

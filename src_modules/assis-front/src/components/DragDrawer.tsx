import React, { PropsWithChildren, useState } from 'react'

const UpIcon = ({ height = 22, width = 22 } = {}) => {
  return (
    <svg
      viewBox="0 0 1024 1024"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      p-id="4238"
      width={width}
      height={height}
    >
      <path
        d="M931.686 539.922l-352.378-357.43c-0.153-0.155-0.314-0.297-0.467-0.451-0.082-0.084-0.157-0.172-0.24-0.256-18.089-18.354-41.922-27.578-65.892-27.743-0.316-0.004-0.632-0.017-0.948-0.018-0.311 0.001-0.622 0.013-0.933 0.018-23.974 0.162-47.811 9.386-65.903 27.743-0.082 0.083-0.157 0.172-0.239 0.255-0.154 0.154-0.315 0.296-0.468 0.452L91.84 539.921c-37.153 37.685-37.476 99.034-0.718 136.331 36.758 37.297 97.231 36.979 134.384-0.707l286.257-290.361L798.02 675.545c37.153 37.685 97.625 38.004 134.383 0.707 36.759-37.296 36.436-98.645-0.717-136.33z"
        fill="#ffffff"
        p-id="4239"
      ></path>
    </svg>
  )
}

export interface DragDrawerProps {
  outSideContent: React.ReactNode
  /**
   * 默认高度
   */
  defaultHight?: string
}
export const DragDrawer = ({
  defaultHight = '12.5rem',
  ...props
}: PropsWithChildren<DragDrawerProps>) => {
  const [isFull, setIsFull] = useState(false)
  return (
    <div className="h-full w-full relative">
      <div style={{ height: `calc(100% - ${defaultHight})` }}>{props.outSideContent}</div>
      <div
        style={{ height: isFull ? '100%' : defaultHight }}
        className="absolute left-0 right-0 bottom-0 bg-[#18181B] rounded-lg transition-all duration-300 "
      >
        <div
          className="flex justify-center items-center py-2 cursor-pointer"
          onClick={() => setIsFull((old) => !old)}
        >
          <div
            className={`${isFull ? 'rotate-180' : ''} origin-center transition-all duration-300`}
          >
            <UpIcon />
          </div>
        </div>
        {props.children}
      </div>
    </div>
  )
}

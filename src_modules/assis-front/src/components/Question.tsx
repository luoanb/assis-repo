import { antdApp } from '@/utils/antdApp'
import utils from '@/utils/utils'
import { CopyFilled } from '@ant-design/icons'
import { Button, Tooltip } from 'antd'
import { PropsWithChildren } from 'react'

// interface IAnswerProps =
export default function Question({
  children,
  className = '',
  ...props
}: PropsWithChildren<React.HtmlHTMLAttributes<HTMLDivElement>>) {
  return (
    <div {...props} className={'flex justify-end ' + className}>
      <pre className="hover-target relative border-r-4 border-primary border-solid text-wrap font-sans leading-6 text-[#999999] bg-gray-900 rounded-sm rounded-b-xl rounded-l-xl p-3 text-small break-words max-w-full">
        {children}
        <div className="flex justify-end items-center hover-show absolute right-2 bottom-2">
          <Tooltip title="复制完整内容">
            <Button
              color="primary"
              aria-label="Like"
              size="small"
              onClick={() => {
                utils.copyText(children as string)
                antdApp.value?.message.info('复制成功')
              }}
            >
              <CopyFilled className="text-lg" />
            </Button>
          </Tooltip>
        </div>
      </pre>
    </div>
  )
}

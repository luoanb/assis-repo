import { Button, Spinner, Tooltip } from '@nextui-org/react'
// import copy from '@/assets/taxation/copy.svg'
// import zan from '@/assets/taxation/zan.svg'
// import zanA from '@/assets/taxation/zan-active.svg'
// import cai from '@/assets/taxation/cai.svg'
// import caiA from '@/assets/taxation/cai-active.svg'
import { useState } from 'react'
import { motion } from 'framer-motion'
import utils from '@/utils/utils'
// import { MdPreview } from 'md-editor-rt'
// import 'md-editor-rt/lib/preview.css'
import { antdApp } from '@/utils/antdApp'
import {
  CopyFilled,
  // CopyOutlined,
  FrownOutlined,
  SmileFilled
  // SmileOutlined,
  // SwitcherOutlined
} from '@ant-design/icons'
import { MdPreview } from './MdView'

/**
 * 状态
 */
export enum IStatus {
  normal,
  loading,
  error
}

/**
 * 点赞状态
 */
enum Ilike {
  cai,
  zan,
  cancel
}

interface AnswerProps extends React.HtmlHTMLAttributes<HTMLDivElement> {
  /**
   * 状态
   * @default false
   */
  status?: IStatus
  /**
   * 加载提示词
   * @default 思考中
   */
  loadingMsg?: React.ReactNode
  /**
   * 错误提示词
   * @default 出现异常
   */
  errorMsg?: React.ReactNode
  /**
   * 回复内容
   */
  context: React.ReactNode
  /**
   * 聊天历史chatUuid
   *  */
  chatUuid: string
  /** 点赞点踩状态 */
  isLike: boolean | any
}

export default function Answer({
  status = IStatus.normal,
  loadingMsg = '思考中',
  errorMsg = '出现异常',
  className = '',
  chatUuid = '',
  isLike = null,
  context,
  ...props
}: AnswerProps) {
  /**
   * 点赞点踩
   */
  const [likeOrStomp, setlikeOrStomp] = useState<number>(
    isLike != null ? (isLike ? Ilike.zan : Ilike.cai) : Ilike.cancel
  )
  const [show, setShow] = useState<boolean>(false)
  /**
   * 点赞点踩 接口调用
   */
  const likeOrStompFn = (status: number) => {
    // client.chatApiLikeOrStomp({
    //   chatUuid: chatUuid,
    //   status: status
    // })
  }
  return (
    <div
      {...props}
      className={'flex flex-col items-start ' + className}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <div className="relative min-h-8 hover-target">
        {status == IStatus.normal ? (
          <MdPreview
            theme="dark"
            className="border-0 border-l-4 border-primary border-solid md-view-auswer text-wrap min-w-[7.5rem] font-sans rounded-sm bg-gray-900 rounded-b-xl rounded-r-xl p-0 text-small"
            modelValue={context as string}
          />
        ) : null}
        {status == IStatus.error ? (
          <div className="text-jh-link flex  rounded-sm bg-gray-900 rounded-b-xl rounded-r-xl p-3 text-small">
            {errorMsg}
          </div>
        ) : null}
        {status == IStatus.loading ? (
          <div className="text-jh-link flex  rounded-sm bg-gray-900 rounded-b-xl rounded-r-xl p-3 text-small">
            <Spinner
              size="sm"
              className="mr-2 border-jh-link"
              classNames={{
                circle1: 'border-b-jh-link',
                circle2: 'border-b-jh-link'
              }}
            />
            {loadingMsg}
          </div>
        ) : null}

        <div className="flex justify-end items-center hover-show absolute right-2 bottom-2">
          <Tooltip content="复制完整内容">
            <Button
              color="primary"
              isIconOnly
              variant="faded"
              aria-label="Like"
              size="sm"
              onClick={() => {
                utils.copyText(context as string)
                antdApp.value?.message.info('复制成功')
              }}
            >
              <CopyFilled className="text-lg" />
            </Button>
          </Tooltip>
        </div>
      </div>
    </div>
  )
}

import Answer, { IStatus } from '@/components/Answer'
import Question from '@/components/Question'
import { CloseOutlined, DeleteOutlined, RightOutlined, SendOutlined } from '@ant-design/icons'
import {
  Button,
  Card,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  ScrollShadow,
  Textarea,
  Tooltip
} from '@nextui-org/react'
import { useEffect, useRef, useState } from 'react'
import * as front from '@/utils/vscodeFrontend'
import { MdPreview } from '@/components/MdView'
import { WorkStation, dashStore } from '@/store'
import { socket } from '@/socket'
import { useSnapshot } from 'valtio'

/**
 * 消息体
 */
interface Msg {
  content: string
  status: IStatus
  role: string
}

export default function Chat() {
  const workSnap = useSnapshot(dashStore.work)

  const setWorkStation = (value: WorkStation) => {
    dashStore.setWorkStation(value)
  }

  const getSessionId = () => encodeURIComponent(dashStore.work.workStation?.path || '')
  const [msgs, setMsgs] = useState<Msg[]>([])
  const bottomS = useRef<HTMLDivElement>(null)
  const loadList = async () => {
    const res: any = await front.request('/ai/chat/list', {
      sessionId: getSessionId()
    })
    console.log(res, 'res')
    setMsgs(
      res.data?.map((it: any) => {
        return {
          ...it,
          name: it.role,
          message: it.content
        }
      })
    )
    scrollToBottom()
  }

  const scrollToBottom = () => {
    setTimeout(() => {
      bottomS.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }, 10)
  }

  const connSocket = () => {
    socket.socketEvent.addListen('openInfile', (data) => {
      setWorkStation({ ...data.data, isUse: true })
      loadList()
    })
    socket.socketEvent.addListen('selectChange', (data) => {
      console.log('selectChange', data)
      const resData: WorkStation = data.data
      // 属于当前工作区 // 非展示不可使用snap
      if (resData.path == dashStore.work.workStation?.path) {
        // workSnap.workStation = resData
        setWorkStation({ ...resData, isUse: true })
      }
    })
  }

  const removelist = async () => {
    const res = await front.request('/ai/chat/deleteAll', {
      sessionId: getSessionId()
    })
    console.log(res, 'res')
    loadList()
  }

  const [isLoding, setIsLoading] = useState(false)
  const [input, setInput] = useState('')
  const send = async ({ isFile = false, value = '', cleanSelect = true } = {}) => {
    const content = value || input
    if (!content && !isFile) {
      return
    }
    setIsLoading(true)
    pushMsg(
      {
        role: 'user',
        content: isFile ? '文件内容解析中' : content,
        status: IStatus.normal
      },
      {
        role: 'assistant',
        content: '',
        status: IStatus.loading
      }
    )
    // 滚动到底部
    scrollToBottom()
    // 清除工作区选中内容
    if (cleanSelect) {
      setWorkStation({ ...workSnap.workStation, isUse: false })
    }

    front.streamRequest(
      '/ai/chat',
      {
        isFile,
        sessionId: getSessionId(),
        question: content
      },
      (res) => {
        console.log(res, 'res')
        if (res.code == 500) {
          setIsLoading(false)
          setInput('')
        } else {
          upLastMsg((old) => {
            return {
              ...old,
              status: IStatus.normal,
              content: old.content + (res.data?.result || '')
            }
          })
          scrollToBottom()
          if (!res?.isNotDone) {
            setIsLoading(false)
            setInput('')
          }
        }
      }
    )
  }

  const pushMsg = (...value: Msg[]) => {
    setMsgs((old) => [...old, ...value])
  }

  const upLastMsg = (callbak: (old: Msg) => Msg) => {
    setMsgs((old) => {
      const last = old[old.length - 1]
      const newValue = callbak(last)
      old[old.length - 1] = newValue
      return [...old]
    })
  }

  /**
   * 是否使用右键返回内容
   * @returns
   */
  const isUseSelect = () => workSnap.workStation?.isUse && workSnap.workStation?.select?.context

  /**
   * 获取工作区选中的内容
   * @param code 默认true; true: ```context```; fasle:context
   * @param fullWord 默认true; true: 当没有选中内容时, 返回当前文件的所有文本; false: 没有选中内容时返回 ""
   * @returns
   */
  const getSelectContext = ({ code = true, fullWord = true } = {}) => {
    const formatCode = (value: string) => {
      if (code && value) {
        return '```\n' + value + ' \n```'
      }
      return value
    }
    // 标识不使用选中内容
    if (!workSnap.workStation?.isUse) {
      if (fullWord) {
        return formatCode(workSnap.workStation?.file || '')
      }
      return formatCode('')
    }
    // 要使用选中内容: 优先使用选中内容, 没有判断是否要使用全文
    if (workSnap.workStation?.select?.context) {
      return formatCode(workSnap.workStation?.select?.context)
    }
    return formatCode(fullWord ? workSnap.workStation?.file || '' : '')
  }

  useEffect(() => {
    connSocket()
    // loadList()
  }, [])
  return (
    <div className="h-full flex-1 flex flex-col overflow-hidden pt-2 pb-4">
      <div className="h-full flex flex-col overflow-hidden max-w-[62.5rem] w-[95vw] m-auto">
        {workSnap.workStation?.path ? (
          <div className="flex justify-between items-center mb-2 p-2 pl-4  rounded-2xl">
            <p>文件地址: {workSnap.workStation?.path}</p>
            <Tooltip disableAnimation content="分析一下本页的代码">
              <Button color="primary" onClick={() => send({ isFile: true })}>
                分析一下
              </Button>
            </Tooltip>
          </div>
        ) : null}
        <ScrollShadow className="flex-1 h-0 overflow-auto pr-2">
          {!msgs.length ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col">
                <p className="font-bold text-3xl">需要我做什么呢？</p>
                <p className="text-gray-400 text-lg">比如分析一下、代码检查BUG</p>
                <p className="font-bold text-xl mt-2">选中你有疑问的代码就可以直接提问了!</p>
                <p className="text-gray-400 text-lg">或者让我们来一次愉快的聊天吧</p>
              </div>
            </div>
          ) : null}
          {msgs.map?.((it) => {
            return it.role == 'user' ? (
              <Question className="mb-2">{it.content}</Question>
            ) : (
              <Answer
                className="mb-4"
                isLike={0}
                chatUuid=""
                status={it.status}
                context={it.content}
              ></Answer>
            )
          })}
          <div id="bottom-s" ref={bottomS}></div>
        </ScrollShadow>
        <Card>
          <div className="p-2">
            <div className="flex items-end  rounded-xl ">
              <Button
                color="primary"
                // size="sm"
                aria-label="Like"
                className="mr-2"
                onClick={() =>
                  send({
                    value: `
**提示词**：
你是一位幽默大师，擅长讲各种类型的笑话，包括冷笑话、儿童笑话、智力笑话和成人笑话。你的目标是逗笑听众，同时根据他们的反应调整笑话的风格和节奏。你的笑话幽默而不低俗，适合各种场合。请你开始讲一个能让人开怀大笑的笑话。

**实例**：
1. 给我讲一个冷笑话。
2. 你能讲个适合孩子的笑话吗？
3. 来个脑筋急转弯式的笑话吧。
4. 有什么有趣的职场笑话吗？
5. 讲一个幽默却又有点智慧的笑话。

你可以根据不同的需求，灵活调整笑话的风格和内容。
**初始化**
按照以上规则, 输出一个笑话。
`
                  })
                }
              >
                来个笑话吧
              </Button>
              <div className="flex flex-col border border-gray-800 rounded-xl p-2 bg-[#27272A] transition-all">
                <div className="flex items-center">
                  {isUseSelect() ? (
                    <div className="flex items-center justify-between mb-2">
                      <Tooltip
                        content={
                          <ScrollShadow className="mb-2 py-2 max-h-[18.75rem] overflow-auto max-w-[37.5rem]">
                            <MdPreview
                              theme="dark"
                              className="bg-[#18181B] md-onlycode"
                              modelValue={getSelectContext()}
                            />
                          </ScrollShadow>
                        }
                      >
                        <Chip color="success" size="sm" className="mr-2">
                          选区
                        </Chip>
                      </Tooltip>
                      {/* <Button
                      isIconOnly
                      size="sm"
                      radius="full"
                      onClick={() => setWorkStation({ ...workSnap.workStation, isUse: false })}
                    >
                      <CloseOutlined />
                    </Button> */}
                    </div>
                  ) : (
                    <div>
                      <Tooltip
                        disableAnimation
                        content="获取当前文件的所有文本, 进关注部分可以在工作区手动选择内容"
                        placement="top-start"
                      >
                        <Chip color="primary" className="mr-2 " size="sm">
                          全文
                        </Chip>
                      </Tooltip>
                    </div>
                  )}
                  <Tooltip
                    disableAnimation
                    content="检测和修复选中区域的代码"
                    placement="top-start"
                  >
                    <Button
                      size="sm"
                      variant="bordered"
                      aria-label="Like"
                      className="mr-2"
                      onClick={() => {
                        send({
                          value:
                            getSelectContext() +
                            '\n检测一下代码有没有什么异常, 如果有, 请提供一个替换方案, 也就是重构这段代码,请注意,需要做到精准替换'
                        })
                      }}
                    >
                      异常检测
                    </Button>
                  </Tooltip>
                  <Button
                    size="sm"
                    variant="bordered"
                    aria-label="Like"
                    className="mr-2"
                    onClick={() => {
                      send({
                        value: `${getSelectContext()}
                      为代码生成注释, 生成规则说明:
                      1. 类、对象、方法、变量, 在定义这四种类型时需要根据编码语言生成符合对应语言中可文档化的注释,如JavaScript中需要使用jsdoc规范来定义;
                      2. 大逻辑段落里的分支需要添加单行注释;
                      3. 其他内容不需要添加注释;
                      4. CSS样式无需添加注释.
                      `
                      })
                    }}
                  >
                    生成注释
                  </Button>
                  <Dropdown>
                    <DropdownTrigger>
                      <Button variant="bordered" size="sm" endContent={<RightOutlined />}>
                        MD文档助手
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Static Actions">
                      <DropdownItem
                        key="1"
                        onClick={() => {
                          send({
                            value:
                              getSelectContext() +
                              '\n 这里有一段markdown文本,请你根据文本的情景优化一下内容(直接返回结果,不要进行其他的解析和解释)'
                          })
                        }}
                      >
                        优化内容
                      </DropdownItem>
                      <DropdownItem
                        key="0"
                        onClick={() => {
                          send({
                            value:
                              getSelectContext() +
                              '\n 这里有一段markdown文本,请把内容翻译为中文(直接返回结果,不要进行其他的解析和解释)'
                          })
                        }}
                      >
                        翻译为中文
                      </DropdownItem>
                      <DropdownItem
                        key="2"
                        onClick={() => {
                          send({
                            value:
                              getSelectContext() +
                              '\n 这里有一段markdown文本,请把内容翻译为英语(直接返回结果,不要进行其他的解析和解释)'
                          })
                        }}
                      >
                        翻译为英语
                      </DropdownItem>
                      <DropdownItem
                        key="3"
                        onClick={() => {
                          send({
                            value:
                              getSelectContext() +
                              '\n 这里有一段markdown文本,请把内容翻译为俄语(直接返回结果,不要进行其他的解析和解释)'
                          })
                        }}
                      >
                        翻译为俄语
                      </DropdownItem>
                      <DropdownItem
                        key="4"
                        onClick={() => {
                          send({
                            value:
                              getSelectContext() +
                              '\n 这里有一段markdown文本,请把内容翻译为法语(直接返回结果,不要进行其他的解析和解释)'
                          })
                        }}
                      >
                        翻译为法语
                      </DropdownItem>
                      <DropdownItem
                        key="5"
                        onClick={() => {
                          send({
                            value:
                              getSelectContext() +
                              '\n 这里有一段markdown文本,请把内容翻译为日语(直接返回结果,不要进行其他的解析和解释)'
                          })
                        }}
                      >
                        翻译为日语
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </div>
            </div>
            <div className="flex items-center mt-2  rounded-xl ">
              {/* <Tooltip disableAnimation content="系统需要人为干预的事项" placement="top-start">
              <Button
                onClick={() => dashStore.setIsOpen(true)}
                color="primary"
                aria-label="Like"
                className="mr-2"
              >
                待确认事项
              </Button>
            </Tooltip> */}
              <Tooltip disableAnimation content="让我们忘记过去，重新开始吧" placement="top-start">
                <Button
                  onClick={removelist}
                  isIconOnly
                  color="danger"
                  aria-label="Like"
                  className="mr-2"
                >
                  <DeleteOutlined />
                </Button>
              </Tooltip>
              <Textarea
                startContent={
                  isUseSelect() ? (
                    <div className="flex items-center rounded-xl p-0 border border-gray-600">
                      <span className="max-w-12 truncate text-gray-400 text-xs pl-1">
                        {workSnap.workStation?.select?.context}
                      </span>
                      <Button
                        isIconOnly
                        size="sm"
                        className="scale-75 border-gray-400"
                        radius="full"
                        variant="bordered"
                        onClick={() => setWorkStation({ ...workSnap.workStation, isUse: false })}
                      >
                        <CloseOutlined />
                      </Button>
                    </div>
                  ) : null
                }
                isDisabled={isLoding}
                placeholder="有什么需要我帮助的吗 (ctrl + enter 发送)"
                className="mr-2"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                minRows={1}
                onKeyDown={(e) => {
                  if (e.key == 'Enter' && e.ctrlKey) {
                    send({
                      value: getSelectContext({ fullWord: false }) + '\n ' + input
                    })
                  }
                }}
              ></Textarea>
              <Tooltip disableAnimation content="ctrl + enter 发送" placement="top-start">
                <Button
                  startContent={<SendOutlined />}
                  onClick={() =>
                    send({
                      value: getSelectContext({ fullWord: false }) + '\n ' + input
                    })
                  }
                  color="primary"
                >
                  发送
                </Button>
              </Tooltip>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

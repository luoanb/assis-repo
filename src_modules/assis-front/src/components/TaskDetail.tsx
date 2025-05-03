import {
  Accordion,
  AccordionItem,
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader
} from '@nextui-org/react'
import Question from './Question'
import Answer, { IStatus } from './Answer'
import { useState } from 'react'
import { OverLay } from './OverLay'
import { CloseOutlined } from '@ant-design/icons'

const MsgsShow = ({ msgs = [] }: any) => {
  const ques = msgs[0].content
  const answ = msgs[msgs.length - 1].content
  const [isOpen, setIsOpen] = useState(false)
  return !isOpen ? (
    <div>
      <div className="flex justify-between mb-2 items-center">
        <p></p>
        <Button size="sm" variant="bordered" color="primary" onClick={() => setIsOpen(true)}>
          查看完整信息
        </Button>
      </div>
      <div className="mb-2">
        <Question className="mb-2">{ques}</Question>
        <Answer
          className="mb-4"
          isLike={0}
          chatUuid=""
          status={IStatus.normal}
          context={answ}
        ></Answer>
      </div>
    </div>
  ) : (
    <div>
      <div className="flex justify-between mb-2 items-center">
        <p></p>
        <Button size="sm" variant="bordered" color="primary" onClick={() => setIsOpen(false)}>
          收起
        </Button>
      </div>
      <div className="mb-2">
        {msgs.map?.((it: any) => {
          return it.role == 'user' ? (
            <Question className="mb-2">{it.content}</Question>
          ) : (
            <Answer
              className="mb-4"
              isLike={0}
              chatUuid=""
              status={IStatus.normal}
              context={it.content}
            ></Answer>
          )
        })}
      </div>
    </div>
  )
}

export interface TaskDetailProps {
  taskInfo: any
  isOpen: boolean
  setIsOpen: (value: boolean) => void
}

export const TaskDetail = (props: TaskDetailProps) => {
  return (
    <OverLay isOpen={props.isOpen} onOpenChange={props.setIsOpen}>
      <Card className="h-[100vh] w-[100vw]">
        <CardHeader className="flex justify-between">
          <h1>
            {props.taskInfo?.name}
            {String(props.isOpen)}
          </h1>
          <Button
            isIconOnly
            radius="full"
            onClick={() => {
              console.log('点击关闭')
              props.setIsOpen(false)
            }}
          >
            <CloseOutlined />
          </Button>
        </CardHeader>
        <CardBody>
          {props.taskInfo?.process ? (
            <div>
              <h1 className="text-lg mb-2">执行节点</h1>
              <Accordion variant="splitted">
                {props.taskInfo?.process.map((item: any, index: number) => {
                  const ques = item.result.msgs[0].content
                  const answ = item.result.msgs[item.result.msgs.length - 1].content
                  return (
                    <AccordionItem
                      key={index}
                      className="overflow-hidden"
                      classNames={{ titleWrapper: 'overflow-hidden w-full' }}
                      title={'节点' + (index + 1)}
                      subtitle={
                        <div className="flex w-full">
                          <p className="truncate flex-1 w-0">{ques}</p>
                          <p className="truncate flex-1 w-0 text-primary">{answ}</p>
                        </div>
                      }
                    >
                      <MsgsShow msgs={item.result.msgs} />
                    </AccordionItem>
                  )
                })}
              </Accordion>
            </div>
          ) : null}
        </CardBody>
      </Card>
    </OverLay>
  )
}

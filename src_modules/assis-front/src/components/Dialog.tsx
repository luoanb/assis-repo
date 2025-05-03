import { dashStore } from '@/store'
import { feedbackStore } from '@/store/feedback'
import { FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons'
import {
  Button,
  Card,
  CardBody,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Tab,
  Tabs,
  Textarea
} from '@nextui-org/react'
import { useState } from 'react'
import { useSnapshot } from 'valtio'

export type FeedbackItem = Partial<{
  /**
   * 待反馈任务id
   */
  url: string
  /**
   * 标题
   */
  title?: string
  /**
   * 详细描述
   */
  infomation: string
  /**
   * 帮助文本
   */
  helpText: string
  /**
   * 状态/原样返回
   */
  state: string
}>

export const Dialog = () => {
  const dashStoreSnap = useSnapshot(dashStore.dialog)
  const feedbackSnap = useSnapshot(feedbackStore.state)
  // const [isOpen, setIsOpen] = useState(true)
  // const [feedback, setFeedback] = useState<FeedbackItem[]>([])
  // /**
  //  * 新增事项
  //  * @param item
  //  */
  // const pushFeedback = (item: FeedbackItem) => {
  //   setFeedback([item].concat(feedback))
  // }
  // /**
  //  * 处理完该事项
  //  * @param index
  //  */
  // const resolve = (index: number) => {
  //   setFeedback(feedback.filter((_, i) => i !== index))
  // }

  const [isFull, setIsFull] = useState<any>('3xl')

  const [currentIndex, setCurrentIndex] = useState<number>(0)
  return (
    <Modal
      isOpen={dashStoreSnap.isOpen}
      onOpenChange={dashStore.setIsOpen}
      size={isFull}
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center">
                <div className="mr-2">待确认事项</div>
                {isFull == '3xl' ? (
                  <Button
                    onClick={() => setIsFull('full')}
                    isIconOnly
                    size="sm"
                    variant="light"
                    radius="full"
                  >
                    <FullscreenOutlined />
                  </Button>
                ) : (
                  <Button
                    onClick={() => setIsFull('3xl')}
                    isIconOnly
                    size="sm"
                    variant="light"
                    radius="full"
                  >
                    <FullscreenExitOutlined />
                  </Button>
                )}
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="overflow-y-auto">
                <Tabs
                  aria-label="Options"
                  isVertical={true}
                  selectedKey={currentIndex}
                  onSelectionChange={(e) => {
                    // @ts-expect-error
                    setCurrentIndex(e)
                  }}
                >
                  {feedbackSnap.feedback.map((it, index) => (
                    <Tab key={index} title={it.title}>
                      <Card>
                        <CardBody>{it.infomation}</CardBody>
                      </Card>
                    </Tab>
                  ))}
                </Tabs>
              </div>
            </ModalBody>
            <ModalFooter>
              {feedbackSnap.feedback.length ? (
                <div className="flex  w-full items-end">
                  <Textarea
                    className="flex-1"
                    placeholder={feedbackSnap.feedback[currentIndex].helpText}
                  ></Textarea>
                  <Button color="primary" className="ml-2" onPress={onClose}>
                    发送
                  </Button>
                </div>
              ) : null}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

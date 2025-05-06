import { DragDrawer } from '@/components/DragDrawer'
import { Button, Input, Popover, Tooltip } from 'antd'
import { request } from '@/utils/vscodeFrontend'
import { useEffect, useState } from 'react'

const MagicIcon = () => (
  <svg
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    p-id="5950"
    width="40"
    height="42"
  >
    <path
      d="M398.2 664.6c-7 0-13.8-2.6-19-7.8-10.6-10.6-10.6-27.6 0-38.2l272.2-272.2c10.6-10.6 27.6-10.6 38.2 0s10.6 27.6 0 38.2l-272.2 272c-5.4 5.2-12.2 8-19.2 8z"
      fill="#FFB454"
      p-id="5951"
    ></path>
    <path
      d="M95 944.2c-21.4-20.6-22.2-54.8-1.6-76.2l260.2-262.8c10.4-10.8 27.4-11.2 38.2-0.8l39 37.4c10.8 10.4 11.2 27.4 0.8 38.2L171.2 942.6c-20.6 21.6-54.8 22.2-76.2 1.6z"
      fill="#EA7860"
      p-id="5952"
    ></path>
    <path
      d="M929.2 716.6h-30v-30c0-16.6-13.4-30-30-30s-30 13.4-30 30v30h-30c-16.6 0-30 13.4-30 30s13.4 30 30 30h30v30c0 16.6 13.4 30 30 30s30-13.4 30-30v-30h30c16.6 0 30-13.4 30-30s-13.4-30-30-30z"
      fill="#FFB454"
      p-id="5953"
    ></path>
    <path
      d="M629.2 716.6m-30 0a30 30 0 1 0 60 0 30 30 0 1 0-60 0Z"
      fill="#FFB454"
      p-id="5954"
    ></path>
    <path
      d="M869.2 556.6m-30 0a30 30 0 1 0 60 0 30 30 0 1 0-60 0Z"
      fill="#FFB454"
      p-id="5955"
    ></path>
    <path
      d="M347.2 416.6h-30v-30c0-16.6-13.4-30-30-30s-30 13.4-30 30v30h-30c-16.6 0-30 13.4-30 30s13.4 30 30 30h30v30c0 16.6 13.4 30 30 30s30-13.4 30-30v-30h30c16.6 0 30-13.4 30-30s-13.4-30-30-30zM487.2 136.6h-30v-30c0-16.6-13.4-30-30-30s-30 13.4-30 30v30h-30c-16.6 0-30 13.4-30 30s13.4 30 30 30h30v30c0 16.6 13.4 30 30 30s30-13.4 30-30v-30h30c16.6 0 30-13.4 30-30s-13.4-30-30-30z"
      fill="#FFDD54"
      p-id="5956"
    ></path>
    <path
      d="M217.2 256.6m-30 0a30 30 0 1 0 60 0 30 30 0 1 0-60 0Z"
      fill="#FFDD54"
      p-id="5957"
    ></path>
    <path
      d="M618.8 100.8c-15-11.2-36.2-0.4-35.8 18.2l1.6 127c0 7.4-3.4 14.4-9.4 18.6L471.4 338c-15.2 10.8-11.4 34.2 6.2 39.8l121.4 37.8c7 2.2 12.6 7.8 14.8 14.8l27.2 87.2 12.4 8.8c5.6 17.8 29 21.4 39.8 6.2l57-93c4.2-6 11.2-9.6 18.6-9.4l127 1.6c18.6 0.2 29.4-21 18.2-35.8l-76-72.6c-4.4-6-5.6-13.6-3.2-20.6l40.8-120.4c6-17.6-10.8-34.4-28.4-28.4l-19.4-3L741.4 180c-7 2.4-14.8 1.2-20.6-3.2l-102-76z"
      fill="#FFE54C"
      p-id="5958"
    ></path>
    <path
      d="M910.2 446.4c18.6 0.2 29.4-21 18.2-35.8l-76-101.8c-4.4-6-5.6-13.6-3.2-20.6L890 167.8c6-17.6-10.8-34.4-28.4-28.4l-34 11.6-36.6 108.2c-2.4 7-1.2 14.8 3.2 20.6l76 101.8c11.2 15 0.4 36.2-18.2 35.8l-127-1.6c-7.4 0-14.4 3.4-18.6 9.4l-65.4 92.6 10.6 34c5.6 17.8 29 21.4 39.8 6.2l73.4-103.8c4.2-6 11.2-9.6 18.6-9.4l126.8 1.6z"
      fill="#FFD500"
      p-id="5959"
    ></path>
    <path
      d="M663.4 360.4l-44.4-13.8c-6.4-2-7.8-10.6-2.2-14.6l37.8-26.8c2.2-1.6 3.4-4.2 3.4-6.8l-0.6-46.4c0-6.8 7.6-10.8 13.2-6.6l37.2 27.8c2.2 1.6 5 2 7.6 1.2l44-14.8c6.4-2.2 12.6 4 10.4 10.4l-15 44c-0.8 2.6-0.4 5.4 1.2 7.6l27.8 37.2c4 5.4 0.2 13.2-6.6 13.2l-46.4-0.6c-2.6 0-5.2 1.2-6.8 3.4l-26.8 37.8c-4 5.6-12.6 4.2-14.6-2.2l-13.8-44.4c-0.8-2.8-2.8-4.8-5.4-5.6z"
      fill="#FFFCC0"
      p-id="5960"
    ></path>
  </svg>
)

export default function Index() {
  const [taskHistory, setTaskHistory] = useState<any[]>([])
  const getTaskHistory = async () => {
    const res: any = await request('/ai/project/list', null)
    console.log(res, 'res')
    setTaskHistory(Array.from(Object.values(res.data)))
    // setTaskHistory(res)
  }

  useEffect(() => {
    getTaskHistory()
  }, [])

  const [input, setInput] = useState('')
  const onStart = async () => {
    const res: any = await request('/ai/project-start', { input })
    console.log(res, 'res')
  }

  const [currentTask, setCurrentTask] = useState<any>({})
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="h-full pb-4 overflow-y-auto overflow-x-hidden flex justify-center items-center">
      <DragDrawer
        outSideContent={
          <div className="h-full w-full flex justify-center items-center">
            <Tooltip placement="top" title="告诉我你的需求, 当然说得尽量明确一些, 剩下的交给我">
              <div>
                <Input
                  className="mb-2 w-[25rem]"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="需要为你做点什么, 比如: 新建一个Vue项目"
                ></Input>
                <Button onClick={onStart} color="primary" icon={<MagicIcon />}>
                  魔法开始
                </Button>
              </div>
            </Tooltip>
          </div>
        }
      >
        <div className="p-3 -mt-11">
          <h1 className="font-bold text-lg">近期使用的项目</h1>
          <div className="flex flex-wrap">
            {taskHistory.map((item: any) => (
              <div className="p-2 rounded border-gray-700 border-1 mt-4 ml-2 cursor-pointer">
                <h1
                  className="text-small"
                  onClick={() => {
                    setCurrentTask(item)
                    setIsOpen(true)
                  }}
                >
                  {item.name}
                </h1>
              </div>
            ))}
          </div>
        </div>
      </DragDrawer>
    </div>
  )
}

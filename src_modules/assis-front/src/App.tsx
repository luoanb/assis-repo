import { Badge, Button, Tab, Tabs, Tooltip } from '@nextui-org/react'
import { App as Antd_App } from 'antd'
import { antdApp } from './utils/antdApp'
import { Dialog } from './components/Dialog'
import Index from './pages/Index'
import './App.css'
import { useEffect, useState } from 'react'
import { HomeOutlined } from '@ant-design/icons'
import { dashStore } from './store'
import Chat from './pages/Chat'
import { socket } from './socket'
import ThinkWorld from './pages/ThinkWorld'
import { LoginDialog } from './components/LoginDialog'

function App() {
  antdApp.value = Antd_App.useApp()
  const [pathname, setPathname] = useState<any>('/chat')
  useEffect(() => {
    const goChat = () => {
      console.log('App')
      setPathname('/chat')
    }
    socket.init()
    socket.socketEvent.addListen('openInfile', goChat)
    // socket.socketEvent.addListen('selectChange', goChat)
  }, [])

  return (
    <div className="dark flex flex-col h-[100vh]">
      <div className="my-2 flex justify-between">
        <Tabs
          className=""
          selectedKey={pathname}
          color="secondary"
          aria-label="Tabs"
          classNames={{ tab: 'flex-1' }}
          onSelectionChange={setPathname}
        >
          <Tab
            id="/"
            key="/"
            title={
              <Badge content="新" shape="circle" color="danger">
                <div className="flex items-center space-x-1">
                  <HomeOutlined />
                  <span>主页</span>
                </div>
              </Badge>
            }
          ></Tab>
          <Tab id="/chat" key="/chat" title="Code"></Tab>
          {/* <Tab id="/think-world" key="/think-world" title="概念世界"></Tab> */}
        </Tabs>
        <Tooltip content="系统需要人为干预的事项" placement="top-start">
          <Button
            onClick={() => dashStore.setIsOpen(true)}
            color="primary"
            aria-label="Like"
            className="mr-2"
          >
            待确认事项
          </Button>
        </Tooltip>
      </div>
      <div className="flex-1 h-0 border-gray-800">
        {pathname == '/' ? <Index /> : null}
        {pathname == '/chat' ? <Chat /> : null}
        {pathname == '/think-world' ? <ThinkWorld /> : null}
      </div>
      <Dialog />
      <LoginDialog />
    </div>
  )
}

export default App

import { Badge, Button, Tabs, Tooltip } from 'antd'
import { App as Antd_App } from 'antd'
import { antdApp } from './utils/antdApp'
import Index from './pages/Index'
import './App.css'
import { useEffect, useState } from 'react'
import { HomeOutlined } from '@ant-design/icons'
import Chat from './pages/Chat'
import { socket } from './socket'
import ThinkWorld from './pages/ThinkWorld'
import { LoginDialog } from './components/LoginDialog'
const { TabPane: Tab } = Tabs
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

  const items = [
    {
      key: "/",
      label: <Badge count="新" color="danger">
        <div className="flex items-center space-x-1">
          <HomeOutlined />
          <span>主页</span>
        </div>
      </Badge>
    },
    {
      key: "/chat",
      label: "Code"
    },
    {
      key: "/",
      label: <Badge count="新" color="danger">
        <div className="flex items-center space-x-1">
          <HomeOutlined />
          <span>主页</span>
        </div>
      </Badge>
    }
  ]

  return (
    <div className="dark flex flex-col h-[100vh]">
      <div className="my-2 flex justify-between">
        <Tabs
          className=""
          activeKey={pathname}
          color="secondary"
          aria-label="Tabs"
          onChange={setPathname}
          items={items}
        >
        </Tabs>
      </div>
      <div className="flex-1 h-0 border-gray-800">
        {pathname == '/' ? <Index /> : null}
        {pathname == '/chat' ? <Chat /> : null}
        {pathname == '/think-world' ? <ThinkWorld /> : null}
      </div>
      <LoginDialog />
    </div>
  )
}

export default App

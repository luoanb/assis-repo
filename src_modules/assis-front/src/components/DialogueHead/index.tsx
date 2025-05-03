import { Button } from '@nextui-org/react'
import { PicRightOutlined } from '@ant-design/icons'
import './index.scss'

export function DialogueHead() {
  return (
    <div className="header">
      <div className="left-select">
        {/* <img src="" className="left-select-icon" alt="" /> */}
        <PicRightOutlined />
      </div>
      <div className="line"></div>
      <div className="">
        {/* <Avatar size="sm" src="https://i.pravatar.cc/150?u=a042581f4e29026024d" />
        <div className="nickname">改革吹风吹满地</div>
        <CaretDownOutlined /> */}
        <Button>登录</Button>
        <Button>注册</Button>
      </div>
    </div>
  )
}

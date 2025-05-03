import loginImg from '@/assets/login-main.png'
import { PropsWithChildren } from 'react'
const LoginLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className="w-screen flex">
      <div style={{ width: '100%', height: '100vh' }} className="flex items-center p-4">
        <img src={loginImg} style={{ height: '100%' }} />
        <div className="flex justify-center items-center w-[100%]">
          <div className="w-[22.75rem] h-[30.38rem] border border-solid rounded-[1rem] border-gray-200 border-3 shadow-medium">
            <div className="flex-col text-left">{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginLayout

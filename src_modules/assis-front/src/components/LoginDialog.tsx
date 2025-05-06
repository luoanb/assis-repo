import { backendApi } from '@/api'
import {
  Button,
  Input,
  Modal,
  Tabs
} from 'antd'
import { useEffect, useRef, useState } from 'react'
import { useAttr, useFormData, Verifications } from 'hook-form-react'
import { token } from '@/utils'
import { antdApp } from '@/utils/antdApp'
import { useExec } from '@/hooks/useExec'
export const LoginDialog = () => {
  const timeRef = useRef<any>(null)
  const [time, setTime] = useState(0)
  /**
   * 倒计时开始
   */
  const timeStart = () => {
    setTime(60)
    timeRef.current = setInterval(() => {
      setTime((old) => {
        if (old <= 0) {
          clearInterval(timeRef.current)
        }
        return old - 1
      })
    }, 1000)
  }
  const loginForm = useFormData<API.LoginDto>({
    username: '',
    password: '',
    captchaId: '',
    verifyCode: ''
  })

  const regForm = useFormData<API.RegisterDto & { repassword: string }>(
    {
      username: '',
      password: '',
      repassword: '',
      code: '',
      lang: 'zh'
    },
    {
      username: [Verifications.required()],
      code: [Verifications.required()],
      password: [Verifications.passwd()],
      repassword: [
        { execute: async (value, formData) => value === formData.password, msg: '两次密码不一致' }
      ]
    }
  )

  const attr = useAttr(loginForm)
  const attrReg = useAttr(regForm)

  const [isOpen, onOpenChange] = useState(false)
  const [captcha, setCaptcha] = useState<API.ImageCaptcha>({ id: '', img: '' })
  const getNewCaptcha = async () => {
    const res2 = await backendApi.captcha.captchaCaptchaByImg({ width: 145, height: 60 })
    setCaptcha(res2)
    loginForm.pushValue('captchaId', res2.id)
  }

  const loginExec = useExec(() => backendApi.auth.authLogin(loginForm.value))

  const login = async () => {
    const res = await loginExec.exec()
    if (res.token) {
      token.set(res.token)
      antdApp.value?.message.success('登录成功')
    }
  }

  const regExec = useExec(() => backendApi.auth.authRegister(regForm.value))

  const register = async () => {
    const isValid = await regForm.doAllValidate()
    if (isValid) {
      const res = await regExec.exec()
      if (res.token) {
        token.set(res.token)
        antdApp.value?.message.success('注册成功')
      }
    }
  }

  const sendEmailCodeExec = useExec(() =>
    backendApi.authEmail.emailSendEmailCode({
      email: regForm.value.username
    })
  )

  useEffect(() => {
    console.log(token.get(), 'token')
    if (!token.get()) {
      onOpenChange(true)
      getNewCaptcha()
    }
    token.onTokenChange((token) => {
      console.log(token, 'onTokenChange:token')
      if (token) {
        onOpenChange(false)
      } else {
        onOpenChange(true)
      }
    })
  }, [])
  return (
    <Modal open={isOpen} onCancel={() => onOpenChange(false)} title="您需要先登录或注册">
      <div>敬请期待</div>
      {/* <Tabs aria-label="Options">
        <Tab key="login" title="密码登录">
          <Input
            {...attr('username', attr.NextUI.N_Input)}
            type="email"
            label="账户"
            placeholder="请输入您的邮箱"
            className="mb-4"
          />
          <Input
            {...attr('password', attr.NextUI.N_Input)}
            type="password"
            label="密码"
            placeholder="请输入密码"
            className="mb-4"
          />
          <div className="flex mb-4 items-start">
            <Input
              {...attr('verifyCode', attr.NextUI.N_Input)}
              label="验证码"
              placeholder=""
              className=" flex-1"
            />
            <img
              src={captcha.img}
              alt=""
              className="w-[7rem] cursor-pointer"
              title="点击换一个"
              onClick={getNewCaptcha}
            />
          </div>
          <Button
            color="primary"
            className="w-full"
            size="lg"
            isLoading={loginExec.isLoading}
            onClick={login}
          >
            登录
          </Button>
        </Tab>
        <Tab key="register" title="注册">
          <div className="flex mb-4 items-start">
            <Input
              type="email"
              label="账户"
              placeholder="请输入您的邮箱"
              className="mr-2"
              {...attrReg('username', attr.NextUI.N_Input)}
            />
            <div className="mt-2">
              {time <= 0 ? (
                <Button
                  isLoading={sendEmailCodeExec.isLoading}
                  onClick={async () => {
                    await sendEmailCodeExec.exec()
                    antdApp.value?.message.success('验证码已发送')
                    timeStart()
                  }}
                >
                  获取验证码
                </Button>
              ) : (
                <div className="w-[5rem]">{time}秒</div>
              )}
            </div>
          </div>
          <Input
            type="password"
            {...attrReg('password', attr.NextUI.N_Input)}
            label="密码"
            placeholder="请输入密码"
            className="mb-4"
          />
          <Input
            {...attrReg('repassword', attr.NextUI.N_Input)}
            type="password"
            label="确认密码"
            placeholder="请再次输入密码"
            className="mb-4"
          />
          <Input
            label="邮箱验证码"
            {...attrReg('code', attr.NextUI.N_Input)}
            placeholder=""
            className="mb-4"
          />
          <Button
            color="primary"
            onPress={register}
            isLoading={regExec.isLoading}
            className="w-full"
            size="lg"
          >
            注册
          </Button>
        </Tab>
        <Tab key="emaillogin" title="邮箱登录">
          <div className="flex mb-4 items-center">
            <Input
              type="email"
              label="账户"
              placeholder="请输入您的邮箱"
              className="mr-2"
            />
            {time <= 0 ? (
              <Button
                onClick={async () => {
                  await backendApi.authEmail.emailSendEmailCode({
                    email: regForm.value.username
                  })
                  antdApp.value?.message.success('验证码已发送')
                  timeStart()
                }}
              >
                获取验证码
              </Button>
            ) : (
              <div className="w-[5rem]">{time}秒</div>
            )}
          </div>
          <Input label="邮箱验证码" placeholder="" className="mb-4" />
          <Button color="primary" onPress={onClose} className="w-full" size="lg">
            登录
          </Button>
        </Tab>
      </Tabs> */}
    </Modal>
  )
}

import { createHashRouter } from 'react-router-dom'
import Index from './pages/Index'

const router = createHashRouter([
  {
    path: '/',
    Component: Index
  },
  {
    path: '/prompt-create',
    Component: Index
  }
])

/**
 * 路由注册
 * @deprecated webview对路由支持有问题 ,未使用
 */
export default router

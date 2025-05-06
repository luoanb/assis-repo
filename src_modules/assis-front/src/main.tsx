import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.scss'
import { ConfigProvider, theme, App as Antd_App } from 'antd'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ConfigProvider
    theme={{
      // 1. 单独使用暗色算法
      algorithm: theme.darkAlgorithm

      // 2. 组合使用暗色算法与紧凑算法

      // algorithm: [theme.darkAlgorithm, theme.compactAlgorithm],
    }}
  >
    <Antd_App>
      <App />
    </Antd_App>
  </ConfigProvider>
)

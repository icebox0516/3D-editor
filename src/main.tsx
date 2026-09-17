import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './ui/styles/tokens.css'
import './ui/styles/app.css'

// 应用入口：设计系统样式（tokens → 组件）先于 App 装载；组合根装配在 App 内经 src/app/bootstrap 完成
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

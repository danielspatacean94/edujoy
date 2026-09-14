import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider } from 'antd'
import roRO from 'antd/locale/ro_RO'
import dayjs from 'dayjs'
import 'dayjs/locale/ro'
import './index.css'
import App from './App'
import { installRomanianValidation } from './locale'

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js')
  })
}

dayjs.locale('ro')
installRomanianValidation()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider locale={roRO}>
      <App />
    </ConfigProvider>
  </StrictMode>,
)

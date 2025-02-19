import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App' // ✅ 정상 작동

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
  // ✅ 불필요한 reportWebVitals 코드 제거
)

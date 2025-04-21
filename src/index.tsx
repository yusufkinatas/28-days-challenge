import React from 'react'
import ReactDOM from 'react-dom/client'
import 'tailwindcss/tailwind.css'

import './firebase/config' // Initialize Firebase
import App from './App'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/globals.css'
import './i18n'
import { QueryClientProvider } from '@/providers/query-provider'
import { ToasterProvider } from '@/providers/toaster-provider'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename="/hireagent">
      <QueryClientProvider>
        <App />
        <ToasterProvider />
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
)

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ReportDataProvider } from './hooks/useReportData'
import { StockProvider } from './hooks/useStock'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <StockProvider>
        <ReportDataProvider>
          <App />
          <Toaster position="top-right" />
        </ReportDataProvider>
      </StockProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

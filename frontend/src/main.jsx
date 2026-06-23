import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Landing from './Landing.jsx'
import App from './App.jsx'
import Login from './Login.jsx'
import Register from './Register.jsx'
import History from './History.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/"         element={<Landing />} />
        <Route path="/app"      element={<App />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/history"  element={<History />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
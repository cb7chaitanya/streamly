import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Pricing from './pages/Pricing.tsx'
import Signup from './pages/Signup.tsx'
import React from 'react'
import Login from './pages/Login.tsx'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import Provider from './components/Layout/Provider.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
    </Provider>
  </React.StrictMode>
)

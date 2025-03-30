import React, { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProductManagement from './pages/ProductManagement'
// import Orders from './pages/Orders'
import Login from './components/Login'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const backendUrl = import.meta.env.VITE_BACKEND_URL
export const currency = '$'

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : '');

  useEffect(() => {
    localStorage.setItem('token', token)
  }, [token])

  return (
    <div className='bg-gray-50 min-h-screen'>
      <ToastContainer position="top-right" autoClose={3000} />
      {token === ""
        ? <Login setToken={setToken} />
        : <>
          <Navbar setToken={setToken} />
          <hr />
          <div className='flex w-full'>
            <Sidebar />
            <div className='w-[82%] mx-auto my-8 text-gray-600 text-base px-8'>
              <Routes>
                <Route path='/products' element={<ProductManagement token={token} />} />
                {/* <Route path='/orders' element={<Orders token={token} />} /> */}
                <Route path='/' element={<Navigate to="/products" replace />} />
              </Routes>
            </div>
          </div>
        </>
      }
    </div>
  )
}

export default App
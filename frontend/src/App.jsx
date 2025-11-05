import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import './App.css'

function App() {
  return (
    <div className="min-h-screen min-w-screen bg-gray-100">
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* <Route path="/" element={<PrivateRoute><HomeFallback /></PrivateRoute>} /> */}

        {/* Admin */}
        {/* <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
        <Route path="/admin/users" element={<AdminRoute><UsersList /></AdminRoute>} />
        <Route path="/admin/stores" element={<AdminRoute><AdminStores /></AdminRoute>} />
        <Route path="/admin/ratings" element={<AdminRoute><AdminRatings /></AdminRoute>} /> */}

        {/* Normal user */}
        {/* <Route path="/stores" element={<PrivateRoute><StoreList /></PrivateRoute>} /> */}

        {/* Store owner */}
        {/* <Route path="/owner/dashboard" element={<PrivateRoute><StoreOwnerDashboard /></PrivateRoute>} /> */}

        {/* Settings */}
        {/* <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} /> */}

        <Route path="*" element={<div className="p-6">Not found</div>} />
      </Routes>
    </div>
  )
}

export default App

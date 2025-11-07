import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Signup from './pages/Signup'
import PrivateRoute from './components/PrivateRoute'
import AdminRoute from './components/AdminRoute'
import AdminDashboard from './components/AdminDashboard'
import UserList from './components/UserList'
import AdminRatings from './pages/AdminRatings'
import AdminStores from './pages/AdminStores'
import StoreOwnerDashboard from './pages/StoreOwnerDashboard'
import StoreList from './pages/StoreList'
import './App.css'


function App() {
  return (
    <div className="min-h-screen min-w-screen bg-gray-100">
      <Navbar />
      <Routes>
        {/* <Route path='/' element={() => { Navigate('/login') }} /> */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* <Route path="/" element={<PrivateRoute><HomeFallback /></PrivateRoute>} /> */}

        {/* Admin */}
        <Route path="/admin" element={<PrivateRoute><AdminRoute><AdminDashboard /></AdminRoute></PrivateRoute>} />
        <Route path="/admin/users" element={<PrivateRoute><AdminRoute><UserList /></AdminRoute></PrivateRoute>} />
        <Route path="/admin/stores" element={<PrivateRoute><AdminRoute><AdminStores /></AdminRoute></PrivateRoute>} />
        <Route path="/admin/ratings" element={<PrivateRoute><AdminRoute><AdminRatings /></AdminRoute></PrivateRoute>} />

        {/* Normal user */}
        <Route path="/stores" element={<PrivateRoute><StoreList /></PrivateRoute>} />

        {/* Store owner */}
        <Route path="/owner/dashboard" element={<PrivateRoute><StoreOwnerDashboard /></PrivateRoute>} />

        {/* Settings */}
        {/* <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} /> */}

        <Route path="*" element={<div className="p-6">Not found</div>} />
      </Routes>
    </div>
  )
}

export default App

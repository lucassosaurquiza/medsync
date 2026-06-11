import './App.css'

import { Toaster } from 'react-hot-toast'
import { Route, Routes } from 'react-router-dom'
import { Login } from './pages/LogIn'
import { Register } from './pages/Register'
import { ReserveYourTurn } from './pages/ReserveYourTurn'
import { Home } from './pages/Home'
import { Dashboard } from './pages/Dashboard'

function App () {
  return (
    <>
      <Toaster position='top-right' />

      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/reserve-turn' element={<ReserveYourTurn />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/dashboard' element={<Dashboard />} />
      </Routes>
    </>
  )
}

export default App

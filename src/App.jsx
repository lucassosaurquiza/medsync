import './App.css'

import { Route, Routes } from 'react-router-dom'
import { Login } from './pages/LogIn'
import { Register } from './pages/Register'
import { ReserveYourTurn } from './pages/ReserveYourTurn'
import { Home } from './pages/Home'
import {  Dashboard } from "./pages/Dashboard"

function App () {
  return (
    <>
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
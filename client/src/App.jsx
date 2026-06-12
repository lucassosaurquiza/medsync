import './App.css'

import { Toaster } from 'react-hot-toast'
import { Route, Routes } from 'react-router-dom'
import { Login } from './pages/LogIn'
import { Register } from './pages/Register'
import { ReserveYourTurn } from './pages/ReserveYourTurn'
import { Home } from './pages/Home'
import { Dashboard } from './pages/Dashboard'
import { AppointmentBooking } from './pages/AppointmentBooking'
import { SpecialistRoute } from './routes/SpecialistRoute'

function App () {
  return (
    <>
      <Toaster position='top-center' />

      <Routes>
        <Route path='/' element={<Home />} />

        <Route path='/reserve-turn' element={<ReserveYourTurn />} />

        <Route
          path='/reserve-turn/:specialistId'
          element={<AppointmentBooking />}
        />

        <Route path='/login' element={<Login />} />

        <Route path='/register' element={<Register />} />

        <Route
          path='/dashboard'
          element={
            <SpecialistRoute>
              <Dashboard />
            </SpecialistRoute>
          }
        />
      </Routes>
    </>
  )
}

export default App

import './App.css'

import { Toaster } from 'react-hot-toast'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Login } from './pages/LogIn'
import { Register } from './pages/Register'
import { ReserveYourTurn } from './pages/ReserveYourTurn'
import { Home } from './pages/Home'
import { Dashboard } from './pages/Dashboard'
import { AppointmentBooking } from './pages/AppointmentBooking'
import { MyAppointments } from './pages/MyAppointments'
import { SpecialistRoute } from './routes/SpecialistRoute'
import { PageTransition } from './components/PageTransition'

function App () {
  const location = useLocation()

  return (
    <>
      <Toaster position='top-center' />
      <PageTransition key={location.pathname}>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/reserve-turn' element={<ReserveYourTurn />} />
          <Route
            path='/reserve-turn/:specialistId'
            element={<AppointmentBooking />}
          />
          <Route path='/my-appointments' element={<MyAppointments />} />
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
      </PageTransition>
    </>
  )
}

export default App

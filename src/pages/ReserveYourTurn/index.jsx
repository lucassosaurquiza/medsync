import { AppointmentCalendar } from '../../components/Appointment/AppointmentCalendar'
import { TimeSlots } from '../../components/Appointment/TimeSlots'
import { Header } from '../../components/Header'
import { SpecialistProfile } from '../../components/SpecialistProfile'
import { MainLayout } from '../../layouts/MainLayout'

import './styles.css'

function ReserveYourTurn () {
  return (
    <>
      <Header />
      <MainLayout>
        <SpecialistProfile />
        <AppointmentCalendar />
        <TimeSlots />
      </MainLayout>
    </>
  )
}

export { ReserveYourTurn }

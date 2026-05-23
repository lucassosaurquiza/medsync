import { AppointmentCalendar } from '../../components/Appointment/AppointmentCalendar'
import { TimeSlots } from '../../components/Appointment/TimeSlots'
import { Footer } from '../../components/Footer'
import { Form } from '../../components/Form'
import { Header } from '../../components/Header'
import { Payments } from '../../components/Payments'
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
        <Form />
        <Payments />
      </MainLayout>
      <Footer />
    </>
  )
}

export { ReserveYourTurn }

import { NavBar } from "../../components/Navbar"
import {  AppointmentCalendar } from "../../components/Appointment/AppointmentCalendar"
import { Footer } from "../../components/Footer"



function Dashboard () {
  return (
    <>
      <NavBar/>
      {/*<Perfil ponele/>*/}
      {/*<Turnos Diarios/>*/}
      <AppointmentCalendar/>
      <Footer/>
    </>
  )
}

export { Dashboard }
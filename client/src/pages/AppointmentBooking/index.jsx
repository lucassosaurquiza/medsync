import './styles.css'

import toast from 'react-hot-toast'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { AppointmentCalendar } from '../../components/Appointment/AppointmentCalendar'
import { AppointmentConfirmationModal } from '../../components/AppointmentConfirmationModal'
import { TimeSlots } from '../../components/Appointment/TimeSlots'
import { Footer } from '../../components/Footer'
import { Form } from '../../components/Form'
import { Header } from '../../components/Header'
import { Payments } from '../../components/Payments'
import { SpecialistProfile } from '../../components/SpecialistProfile'
import { MainLayout } from '../../layouts/MainLayout'

function AppointmentBooking () {
  const { specialistId } = useParams()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [createdAppointment, setCreatedAppointment] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState('')
  const [formData, setFormData] = useState({
    fullName: '',
    dni: '',
    healthInsurance: '',
    reason: ''
  })

  const handleCreateAppointment = async () => {
    if (!selectedDate) {
      toast.error('Seleccioná una fecha')
      return
    }

    if (!selectedTime) {
      toast.error('Seleccioná un horario')
      return
    }

    if (!formData.fullName.trim() || !formData.dni.trim()) {
      toast.error('Completá tus datos')
      return
    }

    const token = localStorage.getItem('token')

    try {
      const patientResponse = await fetch(
        'http://localhost:3000/api/patients/me',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const patientData = await patientResponse.json()

      if (!patientResponse.ok) {
        toast.error(patientData.message)
        return
      }

      const appointmentResponse = await fetch(
        'http://localhost:3000/api/appointments',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            specialistId,
            patientId: patientData.id,
            date: selectedDate.toISOString().split('T')[0],
            time: selectedTime,
            healthInsurance: formData.healthInsurance,
            reason: formData.reason
          })
        }
      )

      const appointmentData = await appointmentResponse.json()

      if (!appointmentResponse.ok) {
        toast.error(appointmentData.message)
        return
      }

      setCreatedAppointment({
        specialistInitial: 'A',
        specialistName: 'Dr. Alejandro Sosa',
        specialty: 'Cardiología',
        date: selectedDate.toLocaleDateString('es-AR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long'
        }),
        time: selectedTime.slice(0, 5),
        workplace: 'Consultorio Central'
      })

      setIsModalOpen(true)
      toast.success('Turno reservado correctamente')
    } catch {
      toast.error('Error al reservar turno')
    }
  }

  return (
    <>
      <Header />

      <MainLayout>
        <main className='appointment-booking'>
          <section className='appointment-booking__header'>
            <h1 className='appointment-booking__title'>Reserva tu turno</h1>
            <p className='appointment-booking__description'>
              Selecciona el profesional, la fecha y el horario que mejor te
              convenga.
            </p>
          </section>

          <section className='appointment-booking__content'>
            <aside className='appointment-booking__left'>
              <Form formData={formData} setFormData={setFormData} />
            </aside>

            <section className='appointment-booking__center'>
              <AppointmentCalendar
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
              />

              <section className='appointment-booking__details'>
                <SpecialistProfile />

                <div className='appointment-booking__detail'>
                  <span className='appointment-booking__detail-icon'>📍</span>
                  <div>
                    <h3>Consultorio Central</h3>
                    <p>Av. Libertador 1200, CABA</p>
                  </div>
                </div>

                <div className='appointment-booking__notice'>
                  <h3>Antes de confirmar</h3>
                  <p>
                    Vas a recibir un recordatorio por WhatsApp. Podés cancelar o
                    modificar tu turno hasta 24 horas antes.
                  </p>
                </div>
              </section>
            </section>

            <aside className='appointment-booking__right'>
              <TimeSlots
                selectedTime={selectedTime}
                setSelectedTime={setSelectedTime}
              />

              <Payments onConfirm={handleCreateAppointment} />
            </aside>
          </section>
        </main>
      </MainLayout>

      <Footer />

      <AppointmentConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        appointment={createdAppointment || {}}
      />
    </>
  )
}

export { AppointmentBooking }

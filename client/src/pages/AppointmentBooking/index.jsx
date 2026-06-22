import './styles.css'

import toast from 'react-hot-toast'
import { MapPin } from 'lucide-react'
import { useEffect, useState } from 'react'
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
import { API_URL } from '../../config/api'

const APP_TIME_ZONE = 'America/Argentina/Buenos_Aires'

const getSpecialistFullName = specialist => (
  `${specialist.name || ''} ${specialist.lastName || ''}`.trim()
)

const formatDateForApi = date => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: APP_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date)

  const dateParts = Object.fromEntries(
    parts
      .filter(part => part.type !== 'literal')
      .map(part => [part.type, part.value])
  )

  return `${dateParts.year}-${dateParts.month}-${dateParts.day}`
}

function AppointmentBooking () {
  const { specialistId } = useParams()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [createdAppointment, setCreatedAppointment] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState('')
  const [specialist, setSpecialist] = useState(null)
  const [isSpecialistLoading, setIsSpecialistLoading] = useState(true)
  const [specialistError, setSpecialistError] = useState('')
  const [slots, setSlots] = useState([])
  const [isSlotsLoading, setIsSlotsLoading] = useState(false)
  const [slotsError, setSlotsError] = useState('')
  const [slotsRefreshKey, setSlotsRefreshKey] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    dni: '',
    phone: '',
    healthInsurance: '',
    reason: ''
  })

  useEffect(() => {
    const controller = new AbortController()

    const getSpecialist = async () => {
      setIsSpecialistLoading(true)
      setSpecialistError('')

      try {
        const response = await fetch(
          `${API_URL}/api/specialists/${encodeURIComponent(specialistId)}`,
          { signal: controller.signal }
        )
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'No se pudo cargar el especialista')
        }

        setSpecialist(data)
      } catch (error) {
        if (error.name !== 'AbortError') {
          setSpecialistError(error.message)
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSpecialistLoading(false)
        }
      }
    }

    getSpecialist()

    return () => controller.abort()
  }, [specialistId])

  useEffect(() => {
    const controller = new AbortController()
    const token = localStorage.getItem('token')

    if (!token) return

    const getPatientProfile = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/patients/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            },
            signal: controller.signal
          }
        )
        const data = await response.json()

        if (!response.ok) return

        setFormData(currentFormData => ({
          ...currentFormData,
          dni: data.dni || '',
          phone: data.phone || ''
        }))
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('No se pudieron precargar los datos del paciente')
        }
      }
    }

    getPatientProfile()

    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (!selectedDate) return

    const controller = new AbortController()

    const getAvailableSlots = async () => {
      setIsSlotsLoading(true)
      setSlotsError('')

      try {
        const date = formatDateForApi(selectedDate)
        const response = await fetch(
          `${API_URL}/api/availability/${encodeURIComponent(specialistId)}/slots?date=${encodeURIComponent(date)}`,
          { signal: controller.signal }
        )
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'No se pudieron cargar los horarios')
        }

        setSlots(Array.isArray(data.slots) ? data.slots : [])
      } catch (error) {
        if (error.name !== 'AbortError') {
          setSlots([])
          setSlotsError(error.message)
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSlotsLoading(false)
        }
      }
    }

    getAvailableSlots()

    return () => controller.abort()
  }, [selectedDate, specialistId, slotsRefreshKey])

  const handleDateSelect = date => {
    setSelectedDate(date || null)
    setSelectedTime('')
    setSlots([])
    setSlotsError('')
    setIsSlotsLoading(false)
  }

  const handleCreateAppointment = async () => {
    if (isSubmitting) return

    if (!specialist) {
      toast.error('No se pudo identificar al especialista')
      return
    }

    if (!selectedDate) {
      toast.error('Seleccioná una fecha')
      return
    }

    if (!selectedTime) {
      toast.error('Seleccioná un horario')
      return
    }

    if (!formData.dni.trim() || !formData.phone.trim()) {
      toast.error('Completa tu DNI y telefono')
      return
    }

    setIsSubmitting(true)

    const token = localStorage.getItem('token')

    try {
      const patientResponse = await fetch(
        `${API_URL}/api/patients/me`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            dni: formData.dni,
            phone: formData.phone
          })
        }
      )

      const patientData = await patientResponse.json()

      if (!patientResponse.ok) {
        toast.error(patientData.message || 'No se pudieron guardar tus datos')
        return
      }

      const appointmentResponse = await fetch(
        `${API_URL}/api/appointments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            specialistId,
            date: formatDateForApi(selectedDate),
            time: selectedTime,
            healthInsurance: formData.healthInsurance,
            reason: formData.reason
          })
        }
      )

      const appointmentData = await appointmentResponse.json()

      if (appointmentResponse.status === 409) {
        setSelectedTime('')
        setSlots(currentSlots => (
          currentSlots.map(slot => (
            slot.time === selectedTime
              ? { ...slot, available: false }
              : slot
          ))
        ))
        setSlotsRefreshKey(currentKey => currentKey + 1)

        toast.error(
          appointmentData.message ||
          'Ese horario acaba de ser reservado. Elegi otro.'
        )
        return
      }

      if (!appointmentResponse.ok) {
        toast.error(appointmentData.message)
        return
      }

      setCreatedAppointment({
        specialistInitial: specialist.name?.charAt(0).toUpperCase() || 'E',
        specialistName: getSpecialistFullName(specialist),
        specialty: specialist.specialty,
        date: selectedDate.toLocaleDateString('es-AR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long'
        }),
        time: selectedTime.slice(0, 5),
        workplace: specialist.workplace || 'Lugar a confirmar'
      })

      setIsModalOpen(true)
      toast.success('Turno reservado correctamente')
    } catch {
      toast.error('Error al reservar turno')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSpecialistLoading || specialistError) {
    return (
      <>
        <Header />

        <MainLayout>
          <main className='appointment-booking appointment-booking--status'>
            {isSpecialistLoading
              ? <p>Cargando especialista...</p>
              : (
                <div>
                  <h1>No pudimos abrir esta agenda</h1>
                  <p>{specialistError}</p>
                </div>
                )}
          </main>
        </MainLayout>

        <Footer />
      </>
    )
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
                setSelectedDate={handleDateSelect}
              />

              <section className='appointment-booking__details'>
                <SpecialistProfile specialist={specialist} />

                <div className='appointment-booking__detail'>
                  <MapPin className='appointment-booking__detail-icon' size={20} />
                  <div>
                    <h3>Lugar de atencion</h3>
                    <p>{specialist.workplace || 'A confirmar con el especialista'}</p>
                  </div>
                </div>

                <div className='appointment-booking__notice'>
                  <h3>Antes de confirmar</h3>
                  <p>
                    La solicitud quedara pendiente hasta que el especialista la
                    acepte. Vas a recibir una notificacion con su respuesta.
                  </p>
                </div>
              </section>
            </section>

            <aside className='appointment-booking__right'>
              <TimeSlots
                hasSelectedDate={Boolean(selectedDate)}
                selectedDate={selectedDate}
                slots={slots}
                isLoading={isSlotsLoading}
                error={slotsError}
                selectedTime={selectedTime}
                setSelectedTime={setSelectedTime}
              />

              <Payments
                price={specialist.price}
                onConfirm={handleCreateAppointment}
                isSubmitting={isSubmitting}
              />
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

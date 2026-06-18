import './styles.css'

import { useCallback, useState } from 'react'
import { useSmartPolling } from '../../hooks/useSmartPolling'
import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { MainLayout } from '../../layouts/MainLayout'
import { CancelAppointmentModal } from '../../components/CancelAppointmentModal'

const statusOptions = ['all', 'pending', 'confirmed', 'cancelled']

function MyAppointments () {
  const [appointments, setAppointments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [isCancelling, setIsCancelling] = useState(false)

  const getAppointments = useCallback(async signal => {
    const token = localStorage.getItem('token')

    try {
      const response = await fetch(
        'http://localhost:3000/api/appointments/my-appointments',
        {
          signal,
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'No se pudieron cargar los turnos')
      }

      setAppointments(Array.isArray(data) ? data : [])
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error(error)
      }
    } finally {
      if (!signal.aborted) {
        setIsLoading(false)
      }
    }
  }, [])

  useSmartPolling(getAppointments)

  const getStatusText = status => {
    const statusMap = {
      pending: 'Pendiente',
      confirmed: 'Confirmado',
      cancelled: 'Cancelado'
    }

    return statusMap[status] || 'Pendiente'
  }

  const getFilterText = status => {
    const filterMap = {
      all: 'Todos',
      pending: 'Pendientes',
      confirmed: 'Confirmados',
      cancelled: 'Cancelados'
    }

    return filterMap[status]
  }

  const formatDate = date => {
    return new Date(date).toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatTime = time => {
    return time.slice(0, 5)
  }

  const filteredAppointments = appointments.filter(appointment => {
    if (selectedStatus === 'all') {
      return appointment.status !== 'cancelled'
    }

    return appointment.status === selectedStatus
  })

  const nextAppointment = appointments.find(
    appointment =>
      appointment.status === 'pending' || appointment.status === 'confirmed'
  )

  const handleOpenCancelModal = appointment => {
    setSelectedAppointment({
      ...appointment,
      formattedDate: formatDate(appointment.date),
      formattedTime: formatTime(appointment.time)
    })

    setIsCancelModalOpen(true)
  }

  const handleCloseCancelModal = () => {
    setIsCancelModalOpen(false)
    setSelectedAppointment(null)
  }

  const handleCancelAppointment = async () => {
    if (!selectedAppointment || isCancelling) return

    const token = localStorage.getItem('token')
    setIsCancelling(true)

    try {
      const response = await fetch(
        `http://localhost:3000/api/appointments/${selectedAppointment.id}/cancel`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const data = await response.json()

      if (!response.ok) {
        alert(data.message)
        return
      }

      setAppointments(prevAppointments =>
        prevAppointments.map(appointment =>
          appointment.id === selectedAppointment.id
            ? { ...appointment, status: 'cancelled' }
            : appointment
        )
      )

      handleCloseCancelModal()
    } catch {
      alert('Error al cancelar turno')
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <>
      <Header />

      <MainLayout>
        <main className='my-appointments'>
          <section className='my-appointments__header'>
            <div>
              <span className='my-appointments__eyebrow'>Agenda personal</span>
              <h1>Mis Turnos</h1>
              <p>Consultá el estado de tus reservas médicas.</p>
            </div>
          </section>

          {isLoading ? (
            <p className='my-appointments__loading'>Cargando turnos...</p>
          ) : appointments.length === 0 ? (
            <section className='my-appointments__empty'>
              <h2>No tenés turnos todavía</h2>
              <p>Cuando reserves un turno, aparecerá en esta sección.</p>
            </section>
          ) : (
            <>
              {nextAppointment ? (
                <section className='next-appointment'>
                  <div className='next-appointment__content'>
                    <span className='next-appointment__label'>
                      Próximo turno
                    </span>

                    <h2>
                      Dr. {nextAppointment.name} {nextAppointment.lastName}
                    </h2>

                    <p>{nextAppointment.specialty}</p>

                    <div className='next-appointment__details'>
                      <span>📅 {formatDate(nextAppointment.date)}</span>
                      <span>🕒 {formatTime(nextAppointment.time)} hs</span>
                    </div>
                  </div>

                  <span
                    className={`appointment-status appointment-status--${nextAppointment.status}`}
                  >
                    {getStatusText(nextAppointment.status)}
                  </span>
                </section>
              ) : (
                <section className='next-appointment next-appointment--empty'>
                  <div className='next-appointment__content'>
                    <span className='next-appointment__label'>
                      Próximo turno
                    </span>

                    <h2>No tenés próximos turnos</h2>

                    <p>
                      Reservá una nueva consulta y vas a poder verla en esta
                      sección.
                    </p>
                  </div>

                  <a className='next-appointment__button' href='/reserve-turn'>
                    Reservar turno
                  </a>
                </section>
              )}

              <section className='my-appointments__filters'>
                {statusOptions.map(status => (
                  <button
                    key={status}
                    className={
                      selectedStatus === status
                        ? 'my-appointments__filter my-appointments__filter--active'
                        : 'my-appointments__filter'
                    }
                    type='button'
                    onClick={() => setSelectedStatus(status)}
                  >
                    {getFilterText(status)}
                  </button>
                ))}
              </section>

              <section className='my-appointments__list'>
                {filteredAppointments.map(appointment => (
                  <article
                    key={appointment.id}
                    className={
                      appointment.status === 'cancelled'
                        ? 'appointment-card appointment-card--cancelled'
                        : 'appointment-card'
                    }
                  >
                    <div className='appointment-card__avatar'>
                      {appointment.name?.charAt(0).toUpperCase()}
                    </div>

                    <div className='appointment-card__body'>
                      <div className='appointment-card__main'>
                        <h2>
                          Dr. {appointment.name} {appointment.lastName}
                        </h2>

                        <p>{appointment.specialty}</p>
                      </div>

                      <div className='appointment-card__details'>
                        <span>📅 {formatDate(appointment.date)}</span>
                        <span>🕒 {formatTime(appointment.time)} hs</span>
                      </div>
                    </div>

                    <div className='appointment-card__actions'>
                      <span
                        className={`appointment-status appointment-status--${appointment.status}`}
                      >
                        {getStatusText(appointment.status)}
                      </span>

                      {appointment.status !== 'cancelled' && (
                        <button
                          className='appointment-card__cancel'
                          type='button'
                          onClick={() => handleOpenCancelModal(appointment)}
                        >
                          Cancelar turno
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </section>
            </>
          )}
        </main>
      </MainLayout>

      <Footer />

      <CancelAppointmentModal
        isOpen={isCancelModalOpen}
        appointment={selectedAppointment}
        onClose={handleCloseCancelModal}
        onConfirm={handleCancelAppointment}
        isSubmitting={isCancelling}
      />
    </>
  )
}

export { MyAppointments }

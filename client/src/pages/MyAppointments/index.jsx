import './styles.css'

import { useEffect, useState } from 'react'
import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { MainLayout } from '../../layouts/MainLayout'

const statusOptions = ['all', 'pending', 'confirmed', 'cancelled']

function MyAppointments () {
  const [appointments, setAppointments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState('all')

  useEffect(() => {
    const getAppointments = async () => {
      const token = localStorage.getItem('token')

      try {
        const response = await fetch(
          'http://localhost:3000/api/appointments/my-appointments',
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        const data = await response.json()

        if (response.ok) {
          setAppointments(data)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    getAppointments()
  }, [])

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
    if (selectedStatus === 'all') return true

    return appointment.status === selectedStatus
  })

  const nextAppointment = appointments[0]

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
              {nextAppointment && (
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
                    onClick={() => setSelectedStatus(status)}
                  >
                    {getFilterText(status)}
                  </button>
                ))}
              </section>

              <section className='my-appointments__list'>
                {filteredAppointments.map(appointment => (
                  <article key={appointment.id} className='appointment-card'>
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

                    <span
                      className={`appointment-status appointment-status--${appointment.status}`}
                    >
                      {getStatusText(appointment.status)}
                    </span>
                  </article>
                ))}
              </section>
            </>
          )}
        </main>
      </MainLayout>

      <Footer />
    </>
  )
}

export { MyAppointments }
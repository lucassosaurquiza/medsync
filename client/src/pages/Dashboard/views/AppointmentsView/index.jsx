import './styles.css'

import { useCallback, useMemo, useState } from 'react'
import { useSmartPolling } from '../../../../hooks/useSmartPolling'

const API_URL = 'http://localhost:3000/api/appointments'

const statusOptions = ['pending', 'confirmed', 'cancelled']

function AppointmentsView () {
  const [selectedStatus, setSelectedStatus] = useState('pending')
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updatingAppointmentId, setUpdatingAppointmentId] = useState(null)

  const getStatusText = status =>
    ({
      pending: 'Pendientes',
      confirmed: 'Confirmados',
      cancelled: 'Cancelados'
    }[status])

  const getStatusBadge = status =>
    ({
      pending: 'Pendiente',
      confirmed: 'Confirmado',
      cancelled: 'Cancelado'
    }[status])

  const getPatientFullName = appointment =>
    [appointment.patientName, appointment.patientLastName]
      .filter(Boolean)
      .join(' ')

  const fetchAppointments = useCallback(async signal => {
    try {
      setError(null)

      const token = localStorage.getItem('token')

      if (!token) {
        throw new Error('No hay sesión activa')
      }

      const response = await fetch(`${API_URL}/specialist/me`, {
        signal,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('No se pudieron cargar los turnos')
      }

      const data = await response.json()
      setAppointments(Array.isArray(data) ? data : [])
    } catch (error) {
      if (error.name !== 'AbortError') {
        setError(error.message)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useSmartPolling(fetchAppointments)

  const updateAppointmentStatus = async (appointmentId, status) => {
    if (updatingAppointmentId !== null) return

    setUpdatingAppointmentId(appointmentId)

    try {
      setError(null)

      const token = localStorage.getItem('token')

      const response = await fetch(`${API_URL}/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'No se pudo actualizar el turno')
      }

      setAppointments(prevAppointments =>
        prevAppointments.map(appointment =>
          appointment.id === appointmentId
            ? { ...appointment, status }
            : appointment
        )
      )
    } catch (error) {
      setError(error.message)
    } finally {
      setUpdatingAppointmentId(null)
    }
  }

  const filteredAppointments = useMemo(() => {
    return appointments.filter(
      appointment => appointment.status === selectedStatus
    )
  }, [appointments, selectedStatus])

  return (
    <section className='appointments-view'>
      <header className='appointments-view__header'>
        <div>
          <span className='appointments-view__eyebrow'>Turnos</span>
          <h1>Gestión de turnos</h1>
          <p>Aceptá, rechazá y revisá las reservas de tus pacientes.</p>
        </div>
      </header>

      <section className='appointments-view__filters'>
        {statusOptions.map(status => (
          <button
            key={status}
            className={
              selectedStatus === status
                ? 'appointments-view__filter appointments-view__filter--active'
                : 'appointments-view__filter'
            }
            type='button'
            onClick={() => setSelectedStatus(status)}
          >
            {getStatusText(status)}
          </button>
        ))}
      </section>

      <section className='appointments-view__summary'>
        <h2>{getStatusText(selectedStatus)}</h2>
        <span>{filteredAppointments.length} turnos</span>
      </section>

      {loading && (
        <div className='appointments-view__empty'>
          <h3>Cargando turnos...</h3>
        </div>
      )}

      {!loading && error && (
        <div className='appointments-view__empty'>
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <section className='appointments-view__list'>
          {filteredAppointments.length === 0 ? (
            <div className='appointments-view__empty'>
              <h3>No hay turnos para mostrar</h3>
              <p>Cuando existan turnos en esta categoría aparecerán acá.</p>
            </div>
          ) : (
            filteredAppointments.map(appointment => (
              <article
                className={`appointment-request-card appointment-request-card--${appointment.status}`}
                key={appointment.id}
              >
                <div className='appointment-request-card__avatar'>
                  {getPatientFullName(appointment).charAt(0) || 'P'}
                </div>

                <div className='appointment-request-card__content'>
                  <div className='appointment-request-card__top'>
                    <div>
                      <h2>
                        {getPatientFullName(appointment) ||
                          'Paciente sin nombre'}
                      </h2>
                      <p>{appointment.reason}</p>
                    </div>

                    <span
                      className={`appointment-request-card__status appointment-request-card__status--${appointment.status}`}
                    >
                      {getStatusBadge(appointment.status)}
                    </span>
                  </div>

                  <div className='appointment-request-card__details'>
                    <span>📅 {appointment.date}</span>
                    <span>🕒 {appointment.time}</span>
                    <span>🏥 {appointment.healthInsurance}</span>
                  </div>
                </div>

                {appointment.status === 'pending' && (
                  <div className='appointment-request-card__actions'>
                    <button
                      className='appointment-request-card__accept'
                      disabled={updatingAppointmentId !== null}
                      type='button'
                      onClick={() =>
                        updateAppointmentStatus(appointment.id, 'confirmed')
                      }
                    >
                      Aceptar
                    </button>

                    <button
                      className='appointment-request-card__reject'
                      disabled={updatingAppointmentId !== null}
                      type='button'
                      onClick={() =>
                        updateAppointmentStatus(appointment.id, 'cancelled')
                      }
                    >
                      Rechazar
                    </button>
                  </div>
                )}
              </article>
            ))
          )}
        </section>
      )}
    </section>
  )
}

export { AppointmentsView }

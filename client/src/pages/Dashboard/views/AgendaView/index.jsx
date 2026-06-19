import './styles.css'

import {
  CalendarDays,
  CircleCheck,
  Clock3,
  Hourglass,
  UserRound
} from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { useSmartPolling } from '../../../../hooks/useSmartPolling'

const AGENDA_URL = 'http://localhost:3000/api/appointments/specialist/me/agenda'

const getPatientFullName = appointment => (
  [appointment.patientName, appointment.patientLastName]
    .filter(Boolean)
    .join(' ') || 'Paciente sin nombre'
)

const getStatusText = status => (
  status === 'confirmed' ? 'Confirmado' : 'Pendiente'
)

const formatAppointmentDate = date => (
  new Date(`${date}T12:00:00`).toLocaleDateString('es-AR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'America/Argentina/Buenos_Aires'
  })
)

function AgendaAppointment ({ appointment, showDate = false }) {
  return (
    <article className='agenda-appointment'>
      <div className='agenda-appointment__time'>
        <Clock3 size={17} />
        <strong>{appointment.time} hs</strong>
      </div>

      <div className='agenda-appointment__content'>
        <div className='agenda-appointment__patient'>
          <UserRound size={18} />
          <div>
            <h3>{getPatientFullName(appointment)}</h3>
            <p>{appointment.reason || 'Sin motivo informado'}</p>
          </div>
        </div>

        <div className='agenda-appointment__meta'>
          {showDate && (
            <span>
              <CalendarDays size={15} />
              {formatAppointmentDate(appointment.date)}
            </span>
          )}

          <span>{appointment.healthInsurance || 'Particular'}</span>
          <span
            className={`agenda-appointment__status agenda-appointment__status--${appointment.status}`}
          >
            {getStatusText(appointment.status)}
          </span>
        </div>
      </div>
    </article>
  )
}

function AgendaView () {
  const [today, setToday] = useState('')
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchAgenda = useCallback(async signal => {
    try {
      setError('')

      const token = localStorage.getItem('token')

      if (!token) {
        throw new Error('No hay una sesion activa')
      }

      const response = await fetch(AGENDA_URL, {
        signal,
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'No se pudo cargar la agenda')
      }

      setToday(data.today || '')
      setAppointments(Array.isArray(data.appointments) ? data.appointments : [])
    } catch (error) {
      if (error.name !== 'AbortError') {
        setError(error.message)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useSmartPolling(fetchAgenda)

  const todayAppointments = useMemo(() => (
    appointments.filter(appointment => appointment.date === today)
  ), [appointments, today])

  const upcomingAppointments = useMemo(() => (
    appointments.filter(appointment => appointment.date > today)
  ), [appointments, today])

  const metrics = useMemo(() => (
    appointments.reduce(
      (summary, appointment) => {
        if (appointment.date === today) {
          summary.today += 1
        }

        if (appointment.status === 'pending') {
          summary.pending += 1
        }

        if (appointment.status === 'confirmed') {
          summary.confirmed += 1
        }

        return summary
      },
      {
        today: 0,
        pending: 0,
        confirmed: 0
      }
    )
  ), [appointments, today])

  return (
    <section className='agenda-view'>
      <header className='agenda-view__header'>
        <span className='agenda-view__eyebrow'>Agenda</span>
        <h1>Tu jornada</h1>
        <p>Revisa los pacientes de hoy y tus proximos turnos.</p>
      </header>

      {loading && (
        <div className='agenda-view__state'>
          <h2>Cargando agenda...</h2>
        </div>
      )}

      {!loading && error && (
        <div className='agenda-view__state agenda-view__state--error'>
          <h2>No pudimos cargar la agenda</h2>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          <section className='agenda-metrics' aria-label='Resumen de agenda'>
            <article className='agenda-metric'>
              <div className='agenda-metric__icon agenda-metric__icon--today'>
                <CalendarDays size={20} />
              </div>
              <div>
                <span>Turnos hoy</span>
                <strong>{metrics.today}</strong>
              </div>
            </article>

            <article className='agenda-metric'>
              <div className='agenda-metric__icon agenda-metric__icon--pending'>
                <Hourglass size={20} />
              </div>
              <div>
                <span>Pendientes por resolver</span>
                <strong>{metrics.pending}</strong>
              </div>
            </article>

            <article className='agenda-metric'>
              <div className='agenda-metric__icon agenda-metric__icon--confirmed'>
                <CircleCheck size={20} />
              </div>
              <div>
                <span>Confirmados proximos</span>
                <strong>{metrics.confirmed}</strong>
              </div>
            </article>
          </section>

          <div className='agenda-view__grid'>
            <section className='agenda-section'>
            <header className='agenda-section__header'>
              <div>
                <span>Hoy</span>
                <h2>Turnos del dia</h2>
              </div>
              <strong>{todayAppointments.length}</strong>
            </header>

            <div className='agenda-section__list'>
              {todayAppointments.length === 0
                ? (
                  <div className='agenda-section__empty'>
                    <CalendarDays size={24} />
                    <p>No tenes turnos para hoy.</p>
                  </div>
                  )
                : todayAppointments.map(appointment => (
                  <AgendaAppointment
                    key={appointment.id}
                    appointment={appointment}
                  />
                ))}
            </div>
            </section>

            <section className='agenda-section'>
            <header className='agenda-section__header'>
              <div>
                <span>Proximamente</span>
                <h2>Proximos turnos</h2>
              </div>
              <strong>{upcomingAppointments.length}</strong>
            </header>

            <div className='agenda-section__list'>
              {upcomingAppointments.length === 0
                ? (
                  <div className='agenda-section__empty'>
                    <CalendarDays size={24} />
                    <p>No hay proximos turnos agendados.</p>
                  </div>
                  )
                : upcomingAppointments.map(appointment => (
                  <AgendaAppointment
                    key={appointment.id}
                    appointment={appointment}
                    showDate
                  />
                ))}
            </div>
            </section>
          </div>
        </>
      )}
    </section>
  )
}

export { AgendaView }

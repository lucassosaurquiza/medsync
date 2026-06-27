import './styles.css'

import { useCallback, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useSmartPolling } from '../../../../hooks/useSmartPolling'
import { API_URL as API_BASE_URL } from '../../../../config/api'

const API_URL = `${API_BASE_URL}/api/appointments`

const statusOptions = ['pending', 'confirmed', 'cancelled']

function AppointmentsView () {
  const [selectedStatus, setSelectedStatus] = useState('pending')
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updatingAppointmentId, setUpdatingAppointmentId] = useState(null)
  const [appointmentToCancel, setAppointmentToCancel] = useState(null)
  const [appointmentToAccept, setAppointmentToAccept] = useState(null)
  const [cancellationReason, setCancellationReason] = useState('')
  const [acceptanceNote, setAcceptanceNote] = useState('')

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
        throw new Error('No hay sesion activa')
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

  const handleRetry = () => {
    setLoading(true)
    fetchAppointments()
  }

  const closeCancellationModal = () => {
    if (updatingAppointmentId !== null) return

    setAppointmentToCancel(null)
    setCancellationReason('')
  }

  const closeAcceptanceModal = () => {
    if (updatingAppointmentId !== null) return

    setAppointmentToAccept(null)
    setAcceptanceNote('')
  }

  const openCancellationModal = appointment => {
    setAppointmentToCancel(appointment)
    setCancellationReason('')
  }

  const openAcceptanceModal = appointment => {
    setAppointmentToAccept(appointment)
    setAcceptanceNote('')
  }

  const updateAppointmentStatus = async (
    appointmentId,
    status,
    details = {}
  ) => {
    if (updatingAppointmentId !== null) return

    const normalizedCancellationReason =
      typeof details.cancellationReason === 'string'
        ? details.cancellationReason.trim()
        : ''
    const normalizedAcceptanceNote =
      typeof details.acceptanceNote === 'string'
        ? details.acceptanceNote.trim()
        : ''

    if (status === 'cancelled' && normalizedCancellationReason.length < 5) {
      toast.error('Ingresa un motivo de al menos 5 caracteres')
      return
    }

    if (status === 'confirmed' && normalizedAcceptanceNote.length < 5) {
      toast.error('Ingresa condiciones de aceptacion de al menos 5 caracteres')
      return
    }

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
        body: JSON.stringify({
          status,
          cancellationReason:
            status === 'cancelled' ? normalizedCancellationReason : undefined,
          acceptanceNote:
            status === 'confirmed' ? normalizedAcceptanceNote : undefined
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'No se pudo actualizar el turno')
      }

      setAppointments(prevAppointments =>
        prevAppointments.map(appointment =>
          appointment.id === appointmentId
            ? {
                ...appointment,
                status,
                cancellationReason:
                  status === 'cancelled'
                    ? normalizedCancellationReason
                    : appointment.cancellationReason,
                acceptanceNote:
                  status === 'confirmed'
                    ? normalizedAcceptanceNote
                    : appointment.acceptanceNote
              }
            : appointment
        )
      )

      if (status === 'confirmed') {
        setSelectedStatus('confirmed')
        setAppointmentToAccept(null)
        setAcceptanceNote('')
      }

      if (status === 'cancelled') {
        setSelectedStatus('cancelled')
        setAppointmentToCancel(null)
        setCancellationReason('')
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setUpdatingAppointmentId(null)
    }
  }

  const filteredAppointments = useMemo(() => {
    return appointments
      .filter(appointment => appointment.status === selectedStatus)
      .sort((firstAppointment, secondAppointment) => (
        secondAppointment.id - firstAppointment.id
      ))
  }, [appointments, selectedStatus])

  const confirmCancellation = () => {
    if (!appointmentToCancel) return

    updateAppointmentStatus(
      appointmentToCancel.id,
      'cancelled',
      { cancellationReason }
    )
  }

  const confirmAcceptance = () => {
    if (!appointmentToAccept) return

    updateAppointmentStatus(
      appointmentToAccept.id,
      'confirmed',
      { acceptanceNote }
    )
  }

  return (
    <section className='appointments-view'>
      <header className='appointments-view__header'>
        <div>
          <span className='appointments-view__eyebrow'>Turnos</span>
          <h1>Gestion de turnos</h1>
          <p>Acepta, rechaza y revisa las reservas de tus pacientes.</p>
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
        <div className='appointments-view__empty appointments-view__empty--error'>
          <h3>No pudimos cargar los turnos</h3>
          <p>{error}</p>
          <button type='button' onClick={handleRetry}>
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && (
        <section className='appointments-view__list'>
          {filteredAppointments.length === 0 ? (
            <div className='appointments-view__empty'>
              <h3>No hay turnos para mostrar</h3>
              <p>Cuando existan turnos en esta categoria apareceran aca.</p>
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
                    <span>Fecha: {appointment.date}</span>
                    <span>Hora: {appointment.time}</span>
                    <span>{appointment.healthInsurance || 'Particular'}</span>
                  </div>
                </div>

                {appointment.status === 'confirmed' && appointment.acceptanceNote && (
                  <div className='appointment-request-card__acceptance-note'>
                    <strong>Condiciones de aceptacion:</strong>
                    <span>{appointment.acceptanceNote}</span>
                  </div>
                )}

                {appointment.status === 'cancelled' && appointment.cancellationReason && (
                  <div className='appointment-request-card__cancel-reason'>
                    <strong>Motivo de cancelacion:</strong>
                    <span>{appointment.cancellationReason}</span>
                  </div>
                )}

                {(appointment.status === 'pending' ||
                  appointment.status === 'confirmed') && (
                  <div className='appointment-request-card__actions'>
                    {appointment.status === 'pending' && (
                      <button
                        className='appointment-request-card__accept'
                        disabled={updatingAppointmentId !== null}
                        type='button'
                        onClick={() => openAcceptanceModal(appointment)}
                      >
                        Aceptar
                      </button>
                    )}

                    <button
                      className='appointment-request-card__reject'
                      disabled={updatingAppointmentId !== null}
                      type='button'
                      onClick={() => openCancellationModal(appointment)}
                    >
                      {appointment.status === 'pending'
                        ? 'Rechazar'
                        : 'Cancelar'}
                    </button>
                  </div>
                )}
              </article>
            ))
          )}
        </section>
      )}

      {appointmentToAccept && (
        <div className='appointment-cancel-modal'>
          <div
            className='appointment-cancel-modal__overlay'
            onClick={closeAcceptanceModal}
          />

          <section className='appointment-cancel-modal__content'>
            <h2>Aceptar turno</h2>

            <p>
              Indica las condiciones o recomendaciones que el paciente debe
              conocer antes de asistir.
            </p>

            <div className='appointment-cancel-modal__summary'>
              <strong>
                {getPatientFullName(appointmentToAccept) ||
                  'Paciente sin nombre'}
              </strong>
              <span>
                {appointmentToAccept.date} - {appointmentToAccept.time}
              </span>
            </div>

            <label>
              Condiciones para el paciente
              <textarea
                value={acceptanceNote}
                onChange={event => setAcceptanceNote(event.target.value)}
                placeholder='Ej: Asistir 10 minutos antes y traer estudios previos.'
                maxLength={255}
                autoFocus
              />
            </label>

            <div className='appointment-cancel-modal__actions'>
              <button
                type='button'
                className='appointment-cancel-modal__secondary'
                onClick={closeAcceptanceModal}
                disabled={updatingAppointmentId !== null}
              >
                Volver
              </button>

              <button
                type='button'
                className='appointment-cancel-modal__primary'
                onClick={confirmAcceptance}
                disabled={updatingAppointmentId !== null}
              >
                {updatingAppointmentId !== null
                  ? 'Procesando...'
                  : 'Confirmar aceptacion'}
              </button>
            </div>
          </section>
        </div>
      )}

      {appointmentToCancel && (
        <div className='appointment-cancel-modal'>
          <div
            className='appointment-cancel-modal__overlay'
            onClick={closeCancellationModal}
          />

          <section className='appointment-cancel-modal__content'>
            <h2>
              {appointmentToCancel.status === 'pending'
                ? 'Rechazar turno'
                : 'Cancelar turno'}
            </h2>

            <p>
              Indica el motivo para que el paciente entienda que ocurrio.
            </p>

            <div className='appointment-cancel-modal__summary'>
              <strong>
                {getPatientFullName(appointmentToCancel) ||
                  'Paciente sin nombre'}
              </strong>
              <span>
                {appointmentToCancel.date} - {appointmentToCancel.time}
              </span>
            </div>

            <label>
              Motivo
              <textarea
                value={cancellationReason}
                onChange={event => setCancellationReason(event.target.value)}
                placeholder='Ej: No podre atender en ese horario.'
                maxLength={255}
                autoFocus
              />
            </label>

            <div className='appointment-cancel-modal__actions'>
              <button
                type='button'
                className='appointment-cancel-modal__secondary'
                onClick={closeCancellationModal}
                disabled={updatingAppointmentId !== null}
              >
                Volver
              </button>

              <button
                type='button'
                className='appointment-cancel-modal__danger'
                onClick={confirmCancellation}
                disabled={updatingAppointmentId !== null}
              >
                {updatingAppointmentId !== null
                  ? 'Procesando...'
                  : 'Confirmar'}
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  )
}

export { AppointmentsView }

import './styles.css'

import {
  CalendarDays,
  Clock3,
  History,
  IdCard,
  Mail,
  Phone,
  UserRound,
  X
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useSmartPolling } from '../../../../hooks/useSmartPolling'
import { API_URL } from '../../../../config/api'

const PATIENTS_URL = `${API_URL}/api/patients/specialist/me`

const statusLabels = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  cancelled: 'Cancelado'
}

const getPatientFullName = patient => (
  [patient.name, patient.lastName]
    .filter(Boolean)
    .join(' ') || 'Paciente sin nombre'
)

const formatAppointmentDate = date => (
  new Date(`${date}T12:00:00`).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Argentina/Buenos_Aires'
  })
)

function PatientsView () {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState('')

  const fetchPatients = useCallback(async signal => {
    try {
      setError('')

      const token = localStorage.getItem('token')

      if (!token) {
        throw new Error('No hay una sesion activa')
      }

      const response = await fetch(PATIENTS_URL, {
        signal,
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'No se pudieron cargar los pacientes')
      }

      setPatients(Array.isArray(data.patients) ? data.patients : [])
    } catch (error) {
      if (error.name !== 'AbortError') {
        setError(error.message)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useSmartPolling(fetchPatients)

  const closeHistory = useCallback(() => {
    setSelectedPatient(null)
    setHistory([])
    setHistoryError('')
  }, [])

  useEffect(() => {
    if (!selectedPatient) return undefined

    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        closeHistory()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [closeHistory, selectedPatient])

  const openHistory = async patient => {
    setSelectedPatient(patient)
    setHistory([])
    setHistoryError('')
    setHistoryLoading(true)

    try {
      const token = localStorage.getItem('token')

      if (!token) {
        throw new Error('No hay una sesion activa')
      }

      const response = await fetch(
        `${PATIENTS_URL}/${patient.id}/history`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'No se pudo cargar el historial')
      }

      setSelectedPatient(data.patient || patient)
      setHistory(Array.isArray(data.appointments) ? data.appointments : [])
    } catch (error) {
      setHistoryError(error.message)
    } finally {
      setHistoryLoading(false)
    }
  }

  return (
    <section className='patients-view'>
      <header className='patients-view__header'>
        <span className='patients-view__eyebrow'>Pacientes</span>
        <h1>Mis pacientes</h1>
        <p>Consulta los datos de las personas que reservaron con vos.</p>
      </header>

      <header className='patients-view__summary'>
        <div>
          <span>Directorio</span>
          <h2>Pacientes vinculados</h2>
        </div>
        <strong>{patients.length}</strong>
      </header>

      {loading && (
        <div className='patients-view__state'>
          <h2>Cargando pacientes...</h2>
        </div>
      )}

      {!loading && error && (
        <div className='patients-view__state patients-view__state--error'>
          <h2>No pudimos cargar los pacientes</h2>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && patients.length === 0 && (
        <div className='patients-view__state'>
          <UserRound size={26} />
          <h2>Todavia no tenes pacientes vinculados</h2>
          <p>Cuando una persona reserve un turno con vos, aparecera aca.</p>
        </div>
      )}

      {!loading && !error && patients.length > 0 && (
        <section className='patients-view__list' aria-label='Pacientes vinculados'>
          {patients.map(patient => {
            const fullName = getPatientFullName(patient)

            return (
              <article className='patient-row' key={patient.id}>
                <div className='patient-row__avatar' aria-hidden='true'>
                  {fullName.charAt(0).toUpperCase()}
                </div>

                <div className='patient-row__identity'>
                  <h2>{fullName}</h2>
                  <span>Paciente</span>
                </div>

                <div className='patient-row__contact'>
                  <span>
                    <Mail size={16} />
                    {patient.email || 'Email no informado'}
                  </span>
                  <span>
                    <Phone size={16} />
                    {patient.phone || 'Telefono no informado'}
                  </span>
                  <span>
                    <IdCard size={16} />
                    {patient.dni ? `DNI ${patient.dni}` : 'DNI no informado'}
                  </span>
                </div>

                <button
                  className='patient-row__history-button'
                  type='button'
                  onClick={() => openHistory(patient)}
                >
                  <History size={17} />
                  Ver historial
                </button>
              </article>
            )
          })}
        </section>
      )}

      {selectedPatient && (
        <div
          className='patient-history__overlay'
          onMouseDown={event => {
            if (event.target === event.currentTarget) closeHistory()
          }}
        >
          <aside
            className='patient-history'
            role='dialog'
            aria-modal='true'
            aria-labelledby='patient-history-title'
          >
            <header className='patient-history__header'>
              <div>
                <span>Historial del paciente</span>
                <h2 id='patient-history-title'>
                  {getPatientFullName(selectedPatient)}
                </h2>
              </div>

              <button
                type='button'
                aria-label='Cerrar historial'
                onClick={closeHistory}
              >
                <X size={21} />
              </button>
            </header>

            <section className='patient-history__contact'>
              <span><Mail size={16} />{selectedPatient.email}</span>
              <span><Phone size={16} />{selectedPatient.phone || 'Sin telefono'}</span>
              <span><IdCard size={16} />{selectedPatient.dni || 'Sin DNI'}</span>
            </section>

            <div className='patient-history__title'>
              <h3>Turnos registrados</h3>
              <strong>{history.length}</strong>
            </div>

            {historyLoading && (
              <div className='patient-history__state'>
                Cargando historial...
              </div>
            )}

            {!historyLoading && historyError && (
              <div className='patient-history__state patient-history__state--error'>
                {historyError}
              </div>
            )}

            {!historyLoading && !historyError && history.length === 0 && (
              <div className='patient-history__state'>
                No hay turnos registrados para este paciente.
              </div>
            )}

            {!historyLoading && !historyError && history.length > 0 && (
              <section className='patient-history__list'>
                {history.map(appointment => (
                  <article className='history-appointment' key={appointment.id}>
                    <div className='history-appointment__heading'>
                      <div>
                        <strong>
                          <CalendarDays size={16} />
                          {formatAppointmentDate(appointment.date)}
                        </strong>
                        <span>
                          <Clock3 size={15} />
                          {appointment.time} hs
                        </span>
                      </div>

                      <span className={`history-appointment__status history-appointment__status--${appointment.status}`}>
                        {statusLabels[appointment.status] || appointment.status}
                      </span>
                    </div>

                    <dl className='history-appointment__details'>
                      <div>
                        <dt>Cobertura</dt>
                        <dd>{appointment.healthInsurance || 'Particular'}</dd>
                      </div>
                      <div>
                        <dt>Motivo</dt>
                        <dd>{appointment.reason || 'Sin motivo informado'}</dd>
                      </div>
                    </dl>
                  </article>
                ))}
              </section>
            )}
          </aside>
        </div>
      )}
    </section>
  )
}

export { PatientsView }

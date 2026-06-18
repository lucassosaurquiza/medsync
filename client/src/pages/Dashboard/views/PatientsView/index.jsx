import './styles.css'

const mockPatients = [
  {
    id: 1,
    name: 'Martina Rossi',
    email: 'martina@email.com',
    phone: '+54 11 2345-6789',
    lastAppointment: '17 Junio 2026',
    totalAppointments: 4,
    status: 'active'
  },
  {
    id: 2,
    name: 'Juan Pérez',
    email: 'juan@email.com',
    phone: '+54 11 9876-5432',
    lastAppointment: '12 Junio 2026',
    totalAppointments: 2,
    status: 'active'
  },
  {
    id: 3,
    name: 'Nancy López',
    email: 'nancy@email.com',
    phone: '+54 11 3333-2222',
    lastAppointment: 'Pendiente',
    totalAppointments: 1,
    status: 'new'
  }
]

function PatientsView () {
  return (
    <section className='patients-view'>
      <header className='patients-view__header'>
        <div>
          <span className='patients-view__eyebrow'>Pacientes</span>
          <h1>Mis pacientes</h1>
          <p>Consultá la información básica de tus pacientes.</p>
        </div>
      </header>

      <section className='patients-view__grid'>
        {mockPatients.map(patient => (
          <article className='patient-card' key={patient.id}>
            <div className='patient-card__avatar'>
              {patient.name.charAt(0)}
            </div>

            <div className='patient-card__content'>
              <div className='patient-card__header'>
                <div>
                  <h2>{patient.name}</h2>
                  <p>{patient.email}</p>
                </div>

                <span className={`patient-card__status patient-card__status--${patient.status}`}>
                  {patient.status === 'new' ? 'Nuevo' : 'Activo'}
                </span>
              </div>

              <div className='patient-card__details'>
                <span>📞 {patient.phone}</span>
                <span>📅 Último turno: {patient.lastAppointment}</span>
                <span>🩺 {patient.totalAppointments} turnos</span>
              </div>

              <button className='patient-card__button' type='button'>
                Ver historial
              </button>
            </div>
          </article>
        ))}
      </section>
    </section>
  )
}

export { PatientsView }
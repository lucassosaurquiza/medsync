import './styles.css'

function AgendaView () {
  return (
    <section className='agenda-view'>
      <header className='agenda-view__header'>
        <div>
          <span className='agenda-view__eyebrow'>Agenda</span>
          <h1>Panel de Control</h1>
          <p>Gestioná tus turnos pendientes y próximos pacientes.</p>
        </div>
      </header>

      <section className='agenda-view__stats'>
        <article className='agenda-stat'>
          <span>Turnos hoy</span>
          <strong>12</strong>
        </article>

        <article className='agenda-stat'>
          <span>Pendientes</span>
          <strong>4</strong>
        </article>

        <article className='agenda-stat'>
          <span>Confirmados</span>
          <strong>8</strong>
        </article>
      </section>

      <section className='agenda-view__grid'>
        <article className='agenda-panel'>
          <div className='agenda-panel__header'>
            <h2>Solicitudes pendientes</h2>
            <span>4 nuevas</span>
          </div>

          <div className='agenda-panel__list'>
            <p>Acá van los turnos pendientes para aceptar o rechazar.</p>
          </div>
        </article>

        <article className='agenda-panel'>
          <div className='agenda-panel__header'>
            <h2>Próximos turnos</h2>
            <span>Hoy</span>
          </div>

          <div className='agenda-panel__list'>
            <p>Acá va la agenda diaria del especialista.</p>
          </div>
        </article>
      </section>
    </section>
  )
}

export { AgendaView }
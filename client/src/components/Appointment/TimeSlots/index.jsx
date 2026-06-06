import './styles.css'

function TimeSlots () {
  return (
    <>
      <section className='time'>
        <h2 className='time__subtitle'>HORARIOS DISPONIBLES (MIERCOLES 7)</h2>
        <div className='time-container'>
          <button className='time-container__button'>09:00 AM</button>
          <button className='time-container__button'>09:30 AM</button>
          <button className='time-container__button'>10:00 AM</button>
          <button className='time-container__button time-container__button--selected'>10:30 AM</button>
          <button className='time-container__button'>11:00 AM</button>
          <button className='time-container__button time-container__button--disable'>11:30 AM</button>
        </div>
      </section>
    </>
  )
}

export { TimeSlots }

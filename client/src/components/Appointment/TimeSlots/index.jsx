import './styles.css'

function TimeSlots ({
  hasSelectedDate,
  selectedDate,
  slots,
  isLoading,
  error,
  selectedTime,
  setSelectedTime
}) {
  const allUnavailable = slots.length > 0 && slots.every(slot => !slot.available)
  const selectedDateLabel = selectedDate?.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'America/Argentina/Buenos_Aires'
  })

  return (
    <section className='time'>
      <h2 className='time__subtitle'>3 - SELECCIONA TU HORARIO</h2>

      {selectedDateLabel && (
        <p className='time__date'>{selectedDateLabel}</p>
      )}

      {!hasSelectedDate && (
        <p className='time__status'>Selecciona una fecha para ver los horarios.</p>
      )}

      {hasSelectedDate && isLoading && (
        <p className='time__status'>Consultando horarios...</p>
      )}

      {hasSelectedDate && !isLoading && error && (
        <p className='time__status time__status--error'>{error}</p>
      )}

      {hasSelectedDate && !isLoading && !error && slots.length === 0 && (
        <p className='time__status'>El especialista no atiende ese dia.</p>
      )}

      {hasSelectedDate && !isLoading && !error && allUnavailable && (
        <p className='time__status time__status--warning'>
          No quedan horarios disponibles para esta fecha.
        </p>
      )}

      {hasSelectedDate && !isLoading && !error && slots.length > 0 && (
        <div className='time-container'>
          {slots.map(slot => (
            <button
              key={slot.time}
              type='button'
              disabled={!slot.available}
              className={
                !slot.available
                  ? 'time-container__button time-container__button--disable'
                  : selectedTime === slot.time
                  ? 'time-container__button time-container__button--selected'
                  : 'time-container__button'
              }
              onClick={() => setSelectedTime(slot.time)}
            >
              {slot.time} hs
            </button>
          ))}
        </div>
      )}
    </section>
  )
}

export { TimeSlots }

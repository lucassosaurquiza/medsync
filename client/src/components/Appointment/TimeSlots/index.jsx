import './styles.css'

const availableTimes = [
  { label: '09:00 AM', value: '09:00:00', disabled: false },
  { label: '09:30 AM', value: '09:30:00', disabled: false },
  { label: '10:00 AM', value: '10:00:00', disabled: false },
  { label: '10:30 AM', value: '10:30:00', disabled: false },
  { label: '11:00 AM', value: '11:00:00', disabled: false },
  { label: '11:30 AM', value: '11:30:00', disabled: true }
]

function TimeSlots ({ selectedTime, setSelectedTime }) {
  return (
    <section className='time'>
      <h2 className='time__subtitle'>3 - SELECCIONA TU HORARIO</h2>

      <div className='time-container'>
        {availableTimes.map(time => (
          <button
            key={time.value}
            type='button'
            disabled={time.disabled}
            className={
              time.disabled
                ? 'time-container__button time-container__button--disable'
                : selectedTime === time.value
                ? 'time-container__button time-container__button--selected'
                : 'time-container__button'
            }
            onClick={() => setSelectedTime(time.value)}
          >
            {time.label}
          </button>
        ))}
      </div>
    </section>
  )
}

export { TimeSlots }

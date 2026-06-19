import './styles.css'


import 'react-day-picker/dist/style.css'
import { DayPicker } from 'react-day-picker'
import { es } from 'react-day-picker/locale'


function AppointmentCalendar ({ selectedDate, setSelectedDate }) {
  return (
    <section className='calendar'>
      <div className='calendar__container'>
        <h1 className='calendar__title'>2 - SELECCIONA UNA FECHA</h1>

        <DayPicker
          mode='single'
          selected={selectedDate}
          onSelect={setSelectedDate}
          locale={es}
          timeZone='America/Argentina/Buenos_Aires'
          className='calendar__daypicker'
          disabled={{ before: new Date() }}
          showOutsideDays
        />
      </div>
    </section>
  )
}

export { AppointmentCalendar }

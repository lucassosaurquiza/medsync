import './styles.css'


import 'react-day-picker/dist/style.css'
import { DayPicker } from 'react-day-picker'


function AppointmentCalendar ({ selectedDate, setSelectedDate }) {
  return (
    <section className='calendar'>
      <div className='calendar__container'>
        <h1 className='calendar__title'>2 - SELECCIONA UNA FECHA</h1>

        <DayPicker
          mode='single'
          selected={selectedDate}
          onSelect={setSelectedDate}
          className='calendar__daypicker'
          disabled={{ before: new Date() }}
          showOutsideDays
        />
      </div>
    </section>
  )
}

export { AppointmentCalendar }

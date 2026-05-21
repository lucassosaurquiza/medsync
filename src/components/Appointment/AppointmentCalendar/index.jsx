import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { useState } from 'react'

import './styles.css'

function AppointmentCalendar () {
  const [selectedDate, setSelectedDate] = useState()

  return (
    <>
      <section className='calendar'>
        <div className='calendar__container'>
          <h1 className='calendar__title'>SELECCIONA UNA FECHA</h1>
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
    </>
  )
}

export { AppointmentCalendar }

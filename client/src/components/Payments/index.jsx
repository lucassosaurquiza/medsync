import { CalendarPlus } from 'lucide-react'

import './styles.css'

function Payments ({ onConfirm }) {
  return (
    <section className='payment'>
      <h2 className='payment__subtitle'>TOTAL ESTIMADO</h2>

      <p className='payment__price'>$12.500</p>

      <button className='payment__button' type='button' onClick={onConfirm}>
        Confirmar Reserva
        <CalendarPlus className='payment__icon' size={22} />
      </button>
    </section>
  )
}

export { Payments }

import { CalendarPlus } from 'lucide-react'

import './styles.css'

function Payments ({ price, onConfirm }) {
  const numericPrice = Number(price)
  const formattedPrice = Number.isFinite(numericPrice)
    ? new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(numericPrice)
    : 'Precio a confirmar'

  return (
    <section className='payment'>
      <h2 className='payment__subtitle'>TOTAL ESTIMADO</h2>

      <p className='payment__price'>{formattedPrice}</p>

      <button className='payment__button' type='button' onClick={onConfirm}>
        Confirmar Reserva
        <CalendarPlus className='payment__icon' size={22} />
      </button>
    </section>
  )
}

export { Payments }

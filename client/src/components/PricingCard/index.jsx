import './styles.css'

import { ButtonChoosePlan } from '../ButtonChoosePlan'
import { Check } from 'lucide-react'

function PricingCard () {
  return (
    <>
      <section className='pricing-card'>
        <h2 className='pricing-card__badge'>UN SOLO PLAN</h2>

        <h3 className='pricing-card__title'>Plan Profesional</h3>

        <span className='pricing-card__price'>$14.999 ARS</span>

        <div className='pricing-card__features'>
          <div className='pricing-card__feature'>
            <Check className='pricing-card__icon' />
            <p className='pricing-card__text'>Agenda digital para tu consultorio</p>
          </div>

          <div className='pricing-card__feature'>
            <Check className='pricing-card__icon' />
            <p className='pricing-card__text'>Confirmaciones y cancelaciones con aviso al paciente</p>
          </div>

          <div className='pricing-card__feature'>
            <Check className='pricing-card__icon' />
            <p className='pricing-card__text'>Perfil profesional visible para pacientes</p>
          </div>

          <div className='pricing-card__feature'>
            <Check className='pricing-card__icon' />
            <p className='pricing-card__text'>Configuracion de disponibilidad y bloqueos</p>
          </div>
        </div>
        <p className='pricing-card__payment'>
          El pago se coordina luego del registro.
        </p>
        <ButtonChoosePlan />
      </section>
    </>
  )
}

export { PricingCard }

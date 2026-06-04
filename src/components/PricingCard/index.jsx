import './styles.css'

import { ButtonChoosePlan } from '../ButtonChoosePlan'
import { Check } from 'lucide-react'

function PricingCard () {
  return (
    <>
      <section className='pricing-card'>
        <h2 className='pricing-card__badge'>MAS ELEGIDO</h2>

        <h3 className='pricing-card__title'>Plan Profesional</h3>

        <span className='pricing-card__price'>$14.999</span>

        <div className='pricing-card__features'>
          <div className='pricing-card__feature'>
            <Check className='pricing-card__icon' />
            <p className='pricing-card__text'>Turnos ilimitados</p>
          </div>

          <div className='pricing-card__feature'>
            <Check className='pricing-card__icon' />
            <p className='pricing-card__text'>Recordatorios wpp</p>
          </div>

          <div className='pricing-card__feature'>
            <Check className='pricing-card__icon' />
            <p className='pricing-card__text'>Ficha médica personalizada</p>
          </div>

          <div className='pricing-card__feature'>
            <Check className='pricing-card__icon' />
            <p className='pricing-card__text'>Soporte técnico 24/7</p>
          </div>
        </div>
        <ButtonChoosePlan />
      </section>
    </>
  )
}

export { PricingCard }

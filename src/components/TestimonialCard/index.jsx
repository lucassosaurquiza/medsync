import './styles.css'

import { Star } from 'lucide-react'
import { SpecialistProfile } from '../SpecialistProfile'

function TestimonialCard ({ testimonial }) {
  return (
    <article className='testimonial-card'>
      <SpecialistProfile />

      <p className='testimonial-card__quote'>
        <i className='testimonial-card__comment'>"{testimonial}"</i>
      </p>

      <div className='testimonial-card__rating'>
        {Array.from({ length: 5 }).map((_, index) => (
          <Star key={index} size={18} fill='currentColor' />
        ))}
      </div>
    </article>
  )
}

export { TestimonialCard }

import './styles.css'

import { TestimonialCard } from '../TestimonialCard'

const testimonials = [
  {
    id: 1,
    testimonial:
      'MedSync cambió radicalmente cómo organizo mi consultorio. Los pacientes aman la facilidad de sacar turno online.'
  },
  {
    id: 2,
    testimonial:
      'Redujimos muchísimo las ausencias gracias a los recordatorios automáticos.'
  },
  {
    id: 3,
    testimonial: 'La implementación fue rápida y el soporte excelente.'
  }
]

function TestimonialCarousel () {
  return (
    <>
      <section className='testimonials-carrousel'>
        {testimonials.map(testimonial => (
          <TestimonialCard
            key={testimonial.id}
            testimonial={testimonial.testimonial}
          />
        ))}
      </section>

      <div className='testimonials-carrousel__indicators'>
        <span className='testimonials-carrousel__indicator testimonials__indicator--active' />
        <span className='testimonials-carrousel__indicator' />
        <span className='testimonials-carrousel__indicator' />
      </div>
    </>
  )
}

export { TestimonialCarousel }

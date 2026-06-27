import './styles.css'

import { useEffect, useMemo, useState } from 'react'
import { TestimonialCard } from '../TestimonialCard'

const testimonials = [
  {
    id: 1,
    testimonial:
      'MedSync me ayudo a ordenar las solicitudes sin vivir respondiendo mensajes sueltos.'
  },
  {
    id: 2,
    testimonial:
      'Ahora mis pacientes ven mi disponibilidad y yo decido que turnos confirmar.'
  },
  {
    id: 3,
    testimonial:
      'La agenda se ve mas profesional y el flujo de reservas es facil de seguir.'
  }
]

function TestimonialCarousel () {
  const [activeIndex, setActiveIndex] = useState(0)

  const totalSlides = testimonials.length

  const trackStyle = useMemo(() => ({
    transform: `translateX(-${activeIndex * 100}%)`
  }), [activeIndex])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveIndex(currentIndex => (currentIndex + 1) % totalSlides)
    }, 4000)

    return () => window.clearInterval(intervalId)
  }, [totalSlides])

  return (
    <>
      <section className='testimonials-carrousel' aria-label='Testimonios'>
        <div className='testimonials-carrousel__track' style={trackStyle}>
          {testimonials.map(testimonial => (
            <div
              className='testimonials-carrousel__slide'
              key={testimonial.id}
            >
              <TestimonialCard testimonial={testimonial.testimonial} />
            </div>
          ))}
        </div>
      </section>

      <div className='testimonials-carrousel__indicators'>
        {testimonials.map((testimonial, index) => (
          <button
            key={testimonial.id}
            className={
              index === activeIndex
                ? 'testimonials-carrousel__indicator testimonials-carrousel__indicator--active'
                : 'testimonials-carrousel__indicator'
            }
            type='button'
            onClick={() => setActiveIndex(index)}
            aria-label={`Ver testimonio ${index + 1}`}
            aria-current={index === activeIndex}
          />
        ))}
      </div>
    </>
  )
}

export { TestimonialCarousel }

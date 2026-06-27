import './styles.css'
import home from '../../assets/home.png'

import { Bell, CalendarClock, Clock, Crown } from 'lucide-react'
import { Header } from '../../components/Header'
import { MainLayout } from '../../layouts/MainLayout'
import { StartButton } from '../../components/StartButton'
import { BenefitCard } from '../../components/BenefitCard'
import { TestimonialCarousel } from '../../components/TestimonialCarousel'
import { Footer } from '../../components/Footer'
import { PricingCard } from '../../components/PricingCard'

function Home () {
  return (
    <>
      <Header />
      <MainLayout>
        <section className='hero'>
          <div className='hero__content'>
            <span className='hero__badge'>
              <Crown size={24} />
              Agenda profesional para especialistas
            </span>

            <h1 className='hero__title'>
              Ordena tu agenda y atende mejor sin depender del cuaderno
            </h1>

            <p className='hero__description'>
              MedSync ayuda a profesionales de salud a recibir solicitudes de
              turno, confirmar reservas y mostrar una presencia mas profesional.
            </p>

            <div className='hero__actions'>
              <StartButton />
            </div>
          </div>
          <img className='hero__img' src={home} alt='' />
        </section>
      </MainLayout>

      <section className='benefits'>
        <MainLayout>
          <h2 className='benefits__title'>Beneficios para tu consultorio</h2>

          <div className='benefits__grid'>
            <BenefitCard
              icon={<Clock size={24} />}
              title='Menos gestion manual'
              description='Centraliza solicitudes, confirmaciones y cancelaciones para reducir mensajes repetidos.'
            />

            <BenefitCard
              icon={<CalendarClock size={24} />}
              title='Imagen profesional'
              description='Mostra tu perfil, especialidad, consultorio, precio y disponibilidad en un solo lugar.'
            />

            <BenefitCard
              icon={<Bell size={24} />}
              title='Control de agenda'
              description='Recibi notificaciones cuando un paciente solicita, cancela o espera respuesta.'
            />
          </div>
        </MainLayout>
      </section>

      <section className='testimonials'>
        <MainLayout>
          <div className='testimonials__header'>
            <h2 className='testimonials__title'>Lo que dicen los colegas</h2>

            <p className='testimonials__description'>
              Pensado para especialistas que estan empezando a trabajar de
              forma independiente.
            </p>
          </div>

          <TestimonialCarousel />
        </MainLayout>
      </section>

      <section className='pricing'>
        <MainLayout>
          <div className='pricing__container'>
            <h1 className='pricing__title'>Un plan simple para empezar</h1>
            <PricingCard />
          </div>
        </MainLayout>
      </section>
      <Footer />
    </>
  )
}

export { Home }

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
              Lider en Salud Digital
            </span>

            <h1 className='hero__title'>
              Gestiona tus turnos con la simpleza que tu consultorio necesita
            </h1>

            <p className='hero__description'>
              Optimiza tu agenda, fideliza a tus pacientes y digitaliza tu
              consultorio en minutos.
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
          <h2 className='benefits__title'>Beneficios</h2>

          <div className='benefits__grid'>
            <BenefitCard
              icon={<Clock size={24} />}
              title='Ahorra Tiempo'
              description='Automatizá la gestión de turnos y liberá a tu secretaría de tareas repetitivas.'
            />

            <BenefitCard
              icon={<CalendarClock size={24} />}
              title='Imagen Profesional'
              description='Brindá a tus pacientes un portal de reservas intuitivo y con tu propia marca.'
            />

            <BenefitCard
              icon={<Bell size={24} />}
              title='Recordatorios'
              description='Alertas automáticas por WhatsApp para reducir el ausentismo hasta en un 40%.'
            />
          </div>
        </MainLayout>
      </section>

      <section className='testimonials'>
        <MainLayout>
          <div className='testimonials__header'>
            <h2 className='testimonials__title'>Lo que dicen los colegas</h2>

            <p className='testimonials__description'>
              Más de 500 profesionales ya transformaron su práctica.
            </p>
          </div>

          <TestimonialCarousel />
        </MainLayout>
      </section>

      <section className='pricing'>
        <MainLayout>
          <div className='pricing__container'>
            <h1 className='pricing__title'>Planes a tu medida</h1>
            <PricingCard />
          </div>
        </MainLayout>
      </section>
      <Footer />
    </>
  )
}

export { Home }

import './styles.css'
import home from '../../assets/home.png'

import { Crown } from 'lucide-react'
import { Header } from '../../components/Header'
import { MainLayout } from '../../layouts/MainLayout'
import { StartButton } from '../../components/StartButton'
import { AdviceButton } from '../../components/AdviceButton'

function Home () {
  return (
    <>
      <Header />
      <MainLayout>
        <div className='hero'>
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
              <AdviceButton />
            </div>
          </div>
          <img className='hero__img' src={home} alt='' />
        </div>
      </MainLayout>
    </>
  )
}

export { Home }

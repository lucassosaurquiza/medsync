import { LoginButton } from '../LogInButton'
import { RegisterButton } from '../RegisterButton'
import './styles.css'

function Header () {
  return (
    <>
      <header className='reserve-turn'>
        <div className='reserve-turn__container'>
          <h1 className='reserve-turn__title'>MedSync</h1>
          <h2 className='reserve-turn__subtitle'>Reservar turno</h2>
        </div>
        <div className='reserve-turn__actions'>
          <LoginButton />
          <RegisterButton />
        </div>
      </header>
    </>
  )
}

export { Header }

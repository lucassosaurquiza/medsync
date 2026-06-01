import { Menu } from 'lucide-react'
import { LoginButton } from '../LogInButton'
import { RegisterButton } from '../RegisterButton'
import './styles.css'
import { Link } from 'react-router-dom'

function Header () {
  return (
    <>
      <header className='header'>
        <div className='header__container'>
          <h1 className='header__title'>MedSync</h1>
        </div>

        <div className='header__actions'>
          <Link to='/'>Inicio</Link>
          <Link to='/reserve-turn'>Reserva tu turno</Link>
          <LoginButton />
          <RegisterButton />
        </div>

        <button className='header__menu-button'>
          <Menu size={28} />
        </button>
      </header>
    </>
  )
}

export { Header }

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

        <nav className='header-nav'>
          <Link className='header-nav__home' to='/'>
            Inicio
          </Link>
          <Link className='header-nav__turn' to='/reserve-turn'>
            Reserva tu turno
          </Link>
          <LoginButton />
          <RegisterButton />
        </nav>

        <button className='header-button'>
          <Menu size={28} />
        </button>
      </header>
    </>
  )
}

export { Header }

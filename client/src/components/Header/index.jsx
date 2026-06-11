import './styles.css'

import { Menu, Bell } from 'lucide-react'
import { LoginButton } from '../LogInButton'
import { RegisterButton } from '../RegisterButton'
import { Link } from 'react-router-dom'

function Header () {
  const user = JSON.parse(localStorage.getItem('user'))

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/'
  }

  return (
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

        {!user ? (
          <>
            <LoginButton />
            <RegisterButton />
          </>
        ) : (
          <div className='header-user'>
            <button className='header-user__notification' type='button'>
              <Bell size={22} />
            </button>

            <div className='header-user__avatar'>
              {user.name?.charAt(0).toUpperCase()}
            </div>

            <button
              className='header-user__logout'
              type='button'
              onClick={handleLogout}
            >
              Salir
            </button>
          </div>
        )}
      </nav>

      <button className='header-button'>
        <Menu size={28} />
      </button>
    </header>
  )
}

export { Header }

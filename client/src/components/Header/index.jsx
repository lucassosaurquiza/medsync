import './styles.css'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { LoginButton } from '../LogInButton'
import { NotificationBell } from '../NotificationBell'
import { RegisterButton } from '../RegisterButton'

function Header () {
  const user = JSON.parse(localStorage.getItem('user'))
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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

      <nav
        className={isMenuOpen ? 'header-nav header-nav--open' : 'header-nav'}
      >
        <NavLink
          className={({ isActive }) =>
            isActive
              ? 'header-nav__home header-nav__link--active'
              : 'header-nav__home'
          }
          to='/'
          onClick={() => setIsMenuOpen(false)}
        >
          Inicio
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            isActive
              ? 'header-nav__turn header-nav__link--active'
              : 'header-nav__turn'
          }
          to='/reserve-turn'
          onClick={() => setIsMenuOpen(false)}
        >
          Reserva tu turno
        </NavLink>

        {user?.role === 'patient' && (
          <NavLink
            className={({ isActive }) =>
              isActive
                ? 'header-nav__appointments header-nav__link--active'
                : 'header-nav__appointments'
            }
            to='/my-appointments'
            onClick={() => setIsMenuOpen(false)}
          >
            Mis turnos
          </NavLink>
        )}

        {user?.role === 'specialist' && (
          <NavLink
            className={({ isActive }) =>
              isActive
                ? 'header-nav__dashboard header-nav__link--active'
                : 'header-nav__dashboard'
            }
            to='/dashboard'
            onClick={() => setIsMenuOpen(false)}
          >
            Panel
          </NavLink>
        )}

        {!user ? (
          <>
            <LoginButton />
            <RegisterButton />
          </>
        ) : (
          <div className='header-user'>
            <NotificationBell />

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

      <button
        className='header-button'
        type='button'
        onClick={() => setIsMenuOpen(currentValue => !currentValue)}
        aria-expanded={isMenuOpen}
        aria-label={isMenuOpen ? 'Cerrar menu' : 'Abrir menu'}
        title={isMenuOpen ? 'Cerrar menu' : 'Abrir menu'}
      >
        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
      </button>
    </header>
  )
}

export { Header }

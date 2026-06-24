import './styles.css'

import { useEffect, useRef, useState } from 'react'
import { LogOut, Menu, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { LoginButton } from '../LogInButton'
import { NotificationBell } from '../NotificationBell'
import { RegisterButton } from '../RegisterButton'
import { disconnectRealtimeSocket } from '../../services/realtime'

function Header () {
  const user = JSON.parse(localStorage.getItem('user'))
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const profileMenuRef = useRef(null)

  const handleLogout = () => {
    disconnectRealtimeSocket()
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/'
  }

  const handleNotificationClick = () => {
    if (user?.role === 'specialist') {
      window.location.href = '/dashboard'
      return
    }

    window.location.href = '/my-appointments'
  }

  useEffect(() => {
    const handleClickOutside = event => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setIsProfileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

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

        {!user && (
          <>
            <LoginButton />
            <RegisterButton />
          </>
        )}
      </nav>

      {user && (
        <div className='header-user'>
          <NotificationBell onNotificationClick={handleNotificationClick} />

          <div className='header-user__profile' ref={profileMenuRef}>
            <button
              className='header-user__avatar-button'
              type='button'
              onClick={() => setIsProfileMenuOpen(isOpen => !isOpen)}
              aria-expanded={isProfileMenuOpen}
              aria-label='Abrir menu de perfil'
              title='Perfil'
            >
              {user.name?.charAt(0).toUpperCase()}
            </button>

            {isProfileMenuOpen && (
              <div className='header-user-menu'>
                <div className='header-user-menu__summary'>
                  <strong>
                    {user.name} {user.lastName}
                  </strong>
                  <span>{user.email}</span>
                </div>

                <button
                  className='header-user-menu__logout'
                  type='button'
                  onClick={handleLogout}
                >
                  <LogOut size={18} />
                  Salir
                </button>
              </div>
            )}
          </div>
        </div>
      )}

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

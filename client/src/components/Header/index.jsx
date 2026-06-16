import './styles.css'

import { useEffect, useRef, useState } from 'react'
import { Menu, Bell } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { LoginButton } from '../LogInButton'
import { RegisterButton } from '../RegisterButton'

function Header () {
  const user = JSON.parse(localStorage.getItem('user'))
  const token = localStorage.getItem('token')

  const [notifications, setNotifications] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const notificationRef = useRef(null)

  const unreadCount = notifications.filter(
    notification => !notification.isRead
  ).length

  useEffect(() => {
    if (!user || !token) return

    const getNotifications = async () => {
      const response = await fetch('http://localhost:3000/api/notifications', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (response.ok) {
        setNotifications(data)
      }
    }

    getNotifications()
  }, [user, token])

  useEffect(() => {
    const handleClickOutside = event => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleMarkAsRead = async notificationId => {
    await fetch(
      `http://localhost:3000/api/notifications/${notificationId}/read`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: 1 }
          : notification
      )
    )
  }

  const handleMarkAllAsRead = async () => {
    await fetch('http://localhost:3000/api/notifications/read-all', {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    setNotifications(prevNotifications =>
      prevNotifications.map(notification => ({
        ...notification,
        isRead: 1
      }))
    )
  }

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
        <NavLink
          className={({ isActive }) =>
            isActive
              ? 'header-nav__home header-nav__link--active'
              : 'header-nav__home'
          }
          to='/'
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
          >
            Mis turnos
          </NavLink>
        )}

        {!user ? (
          <>
            <LoginButton />
            <RegisterButton />
          </>
        ) : (
          <div className='header-user'>
            <div className='header-notifications' ref={notificationRef}>
              <button
                className='header-user__notification'
                type='button'
                onClick={() => setIsOpen(!isOpen)}
              >
                <Bell size={22} />

                {unreadCount > 0 && (
                  <span className='header-user__notification-badge'>
                    {unreadCount}
                  </span>
                )}
              </button>

              {isOpen && (
                <div className='notifications-dropdown'>
                  <div className='notifications-dropdown__header'>
                    <h3>Notificaciones</h3>

                    {unreadCount > 0 && (
                      <button type='button' onClick={handleMarkAllAsRead}>
                        Marcar todas
                      </button>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <p className='notifications-dropdown__empty'>
                      No tenés notificaciones.
                    </p>
                  ) : (
                    <div className='notifications-dropdown__list'>
                      {notifications.map(notification => (
                        <button
                          key={notification.id}
                          type='button'
                          className={
                            notification.isRead
                              ? 'notification-item'
                              : 'notification-item notification-item--unread'
                          }
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <span
                            className={`notification-item__type notification-item__type--${notification.type}`}
                          />

                          <div>
                            <h4>{notification.title}</h4>
                            <p>{notification.message}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

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

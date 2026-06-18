import './styles.css'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import { useSmartPolling } from '../../hooks/useSmartPolling'

const API_URL = 'http://localhost:3000/api/notifications'

function NotificationBell () {
  const token = localStorage.getItem('token')
  const [notifications, setNotifications] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const notificationRef = useRef(null)

  const unreadCount = notifications.filter(
    notification => !notification.isRead
  ).length

  const getNotifications = useCallback(
    async signal => {
      if (!token) return

      try {
        const response = await fetch(API_URL, {
          signal,
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.message || 'No se pudieron cargar las notificaciones'
          )
        }

        setNotifications(Array.isArray(data) ? data : [])
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error(error)
        }
      }
    },
    [token]
  )

  useSmartPolling(getNotifications)

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

  const handleToggleNotifications = () => {
    const nextIsOpen = !isOpen
    setIsOpen(nextIsOpen)

    if (nextIsOpen) {
      getNotifications()
    }
  }

  const handleMarkAsRead = async notificationId => {
    const response = await fetch(`${API_URL}/${notificationId}/read`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (!response.ok) return

    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: 1 }
          : notification
      )
    )
  }

  const handleMarkAllAsRead = async () => {
    const response = await fetch(`${API_URL}/read-all`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (!response.ok) return

    setNotifications(prevNotifications =>
      prevNotifications.map(notification => ({
        ...notification,
        isRead: 1
      }))
    )
  }

  return (
    <div className='header-notifications' ref={notificationRef}>
      <button
        className='header-user__notification'
        type='button'
        onClick={handleToggleNotifications}
        aria-label='Abrir notificaciones'
        title='Notificaciones'
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
  )
}

export { NotificationBell }

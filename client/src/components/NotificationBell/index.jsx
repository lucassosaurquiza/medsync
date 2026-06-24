import './styles.css'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import { useSmartPolling } from '../../hooks/useSmartPolling'
import { API_URL as API_BASE_URL } from '../../config/api'
import { getRealtimeSocket } from '../../services/realtime'

const API_URL = `${API_BASE_URL}/api/notifications`

const formatNotificationDate = value => {
  if (!value) return ''

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return ''

  return date.toLocaleString('es-AR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function NotificationBell ({ onNotificationClick }) {
  const token = localStorage.getItem('token')
  const [notifications, setNotifications] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const notificationRef = useRef(null)
  const isOpenRef = useRef(false)

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

        const nextNotifications = Array.isArray(data) ? data : []

        setNotifications(prevNotifications => {
          const shouldKeepVisibleNotifications =
            isOpenRef.current &&
            nextNotifications.length === 0 &&
            prevNotifications.some(notification => notification.isRead)

          return shouldKeepVisibleNotifications
            ? prevNotifications
            : nextNotifications
        })

        return nextNotifications
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error(error)
        }

        return []
      }
    },
    [token]
  )

  useSmartPolling(getNotifications)

  useEffect(() => {
    const socket = getRealtimeSocket()

    if (!socket) return undefined

    const handleNotificationsUpdated = () => {
      getNotifications()
    }

    socket.on('notifications:updated', handleNotificationsUpdated)

    return () => {
      socket.off('notifications:updated', handleNotificationsUpdated)
    }
  }, [getNotifications])

  useEffect(() => {
    isOpenRef.current = isOpen
  }, [isOpen])

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

  const handleToggleNotifications = async () => {
    const nextIsOpen = !isOpen
    setIsOpen(nextIsOpen)

    if (nextIsOpen) {
      const loadedNotifications = await getNotifications()

      if (loadedNotifications.length > 0) {
        handleMarkAllAsRead({
          keepVisible: true,
          currentNotifications: loadedNotifications
        })
      }
    }
  }

  const markNotificationAsReadLocally = notificationId => {
    setNotifications(prevNotifications =>
      prevNotifications.filter(notification => notification.id !== notificationId)
    )
  }

  const handleMarkAsRead = async notificationId => {
    markNotificationAsReadLocally(notificationId)

    try {
      const response = await fetch(`${API_URL}/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      })

      if (!response.ok) {
        getNotifications()
      }
    } catch (error) {
      console.error('No se pudo marcar la notificacion como leida:', error)
      getNotifications()
    }
  }

  const handleNotificationClick = notification => {
    if (!notification.isRead) {
      markNotificationAsReadLocally(notification.id)
      handleMarkAsRead(notification.id)
    }

    setIsOpen(false)
    onNotificationClick?.(notification)
  }

  const handleMarkAllAsRead = async ({
    keepVisible = false,
    currentNotifications = notifications
  } = {}) => {
    const previousNotifications = currentNotifications

    if (previousNotifications.length === 0) return

    setNotifications(
      keepVisible
        ? previousNotifications.map(notification => ({
          ...notification,
          isRead: true
        }))
        : []
    )

    try {
      const response = await fetch(`${API_URL}/read-all`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      })

      if (!response.ok) {
        setNotifications(previousNotifications)
      }
    } catch (error) {
      console.error('No se pudieron marcar las notificaciones:', error)
      setNotifications(previousNotifications)
    }
  }

  return (
    <div className='header-notifications' ref={notificationRef}>
      <button
        className='header-user__notification'
        type='button'
        onClick={handleToggleNotifications}
        aria-label='Abrir notificaciones'
        aria-expanded={isOpen}
        title='Notificaciones'
      >
        <Bell size={22} />

        {unreadCount > 0 && (
          <span className='header-user__notification-badge'>
            {unreadCount > 99 ? '99+' : unreadCount}
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
              No tenes notificaciones.
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
                  onClick={() => handleNotificationClick(notification)}
                >
                  <span
                    className={`notification-item__type notification-item__type--${notification.type}`}
                  />

                  <div className='notification-item__content'>
                    <h4>{notification.title}</h4>
                    <p>{notification.message}</p>
                    <time dateTime={notification.created_at}>
                      {formatNotificationDate(notification.created_at)}
                    </time>
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

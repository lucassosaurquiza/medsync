import { io } from 'socket.io-client'
import { API_URL } from '../config/api'

let socket

const getRealtimeSocket = () => {
  const token = localStorage.getItem('token')

  if (!token) return null

  if (!socket || socket.auth?.token !== token) {
    socket?.disconnect()

    socket = io(API_URL, {
      auth: {
        token
      },
      autoConnect: true
    })
  }

  return socket
}

const disconnectRealtimeSocket = () => {
  socket?.disconnect()
  socket = null
}

export {
  disconnectRealtimeSocket,
  getRealtimeSocket
}

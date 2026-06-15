import { Navigate } from 'react-router-dom'

function SpecialistRoute ({ children }) {
  const user = JSON.parse(localStorage.getItem('user'))

  if (!user) {
    return <Navigate to='/login' replace />
  }

  if (user.role !== 'specialist') {
    return <Navigate to='/' replace />
  }

  return children
}

export { SpecialistRoute }

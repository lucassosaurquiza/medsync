import './styles.css'

import {
  CalendarDays,
  Clock3,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Users,
  X
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function DashboardSidebar ({ activeView, setActiveView }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleChangeView = view => {
    setActiveView(view)
    setIsMenuOpen(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login', { replace: true })
  }

  return (
    <>
      <header className='dashboard-mobile-header'>
        <h2>MedSync</h2>

        <button type='button' onClick={() => setIsMenuOpen(true)}>
          <Menu size={26} />
        </button>
      </header>

      {isMenuOpen && (
        <div
          className='dashboard-sidebar__overlay'
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <aside
        className={
          isMenuOpen
            ? 'dashboard-sidebar dashboard-sidebar--open'
            : 'dashboard-sidebar'
        }
      >
        <div className='dashboard-sidebar__top'>
          <div className='dashboard-sidebar__brand'>
            <h2>MedSync</h2>
            <span>Panel especialista</span>
          </div>

          <button
            className='dashboard-sidebar__close'
            type='button'
            onClick={() => setIsMenuOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className='dashboard-sidebar__nav'>
          <button
            className={
              activeView === 'agenda'
                ? 'dashboard-sidebar__link dashboard-sidebar__link--active'
                : 'dashboard-sidebar__link'
            }
            type='button'
            onClick={() => handleChangeView('agenda')}
          >
            <LayoutDashboard size={18} />
            Agenda
          </button>

          <button
            className={
              activeView === 'appointments'
                ? 'dashboard-sidebar__link dashboard-sidebar__link--active'
                : 'dashboard-sidebar__link'
            }
            type='button'
            onClick={() => handleChangeView('appointments')}
          >
            <CalendarDays size={18} />
            Turnos
          </button>

          <button
            className={
              activeView === 'patients'
                ? 'dashboard-sidebar__link dashboard-sidebar__link--active'
                : 'dashboard-sidebar__link'
            }
            type='button'
            onClick={() => handleChangeView('patients')}
          >
            <Users size={18} />
            Pacientes
          </button>

          <button
            className={
              activeView === 'availability'
                ? 'dashboard-sidebar__link dashboard-sidebar__link--active'
                : 'dashboard-sidebar__link'
            }
            type='button'
            onClick={() => handleChangeView('availability')}
          >
            <Clock3 size={18} />
            Disponibilidad
          </button>

          <button
            className={
              activeView === 'settings'
                ? 'dashboard-sidebar__link dashboard-sidebar__link--active'
                : 'dashboard-sidebar__link'
            }
            type='button'
            onClick={() => handleChangeView('settings')}
          >
            <Settings size={18} />
            Configuración
          </button>
        </nav>

        <button
          className='dashboard-sidebar__logout'
          type='button'
          onClick={handleLogout}
        >
          <LogOut size={18} />
          Salir
        </button>
      </aside>
    </>
  )
}

export { DashboardSidebar }

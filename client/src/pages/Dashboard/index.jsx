import './styles.css'

import { useState } from 'react'
import { AppointmentsView } from './views/AppointmentsView'
import { DashboardSidebar } from './components/DashboardSideBar'
import { SettingsView } from './views/SettingsView'
import { NotificationBell } from '../../components/NotificationBell'

function Dashboard () {
  const [activeView, setActiveView] = useState('appointments')

  return (
    <main className='dashboard'>
      <DashboardSidebar
        activeView={activeView}
        setActiveView={setActiveView}
      />

      <section className='dashboard__content'>
        <div className='dashboard__notifications'>
          <NotificationBell />
        </div>

        {activeView === 'appointments' && <AppointmentsView />}
        {activeView === 'settings' && <SettingsView />}
      </section>
    </main>
  )
}

export { Dashboard }

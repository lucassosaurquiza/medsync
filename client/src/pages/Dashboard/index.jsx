import './styles.css'

import { useState } from 'react'
import { AppointmentsView } from './views/AppointmentsView'
import { AgendaView } from './views/AgendaView'
import { DashboardSidebar } from './components/DashboardSideBar'
import { SettingsView } from './views/SettingsView'
import { AvailabilityView } from './views/AvailabilityView'
import { NotificationBell } from '../../components/NotificationBell'

function Dashboard () {
  const [activeView, setActiveView] = useState('agenda')

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

        {activeView === 'agenda' && <AgendaView />}
        {activeView === 'appointments' && <AppointmentsView />}
        {activeView === 'availability' && <AvailabilityView />}
        {activeView === 'settings' && <SettingsView />}
      </section>
    </main>
  )
}

export { Dashboard }

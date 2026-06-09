import { CalendarDays, Settings, Plus } from "lucide-react";
import "./styles.css";

function DashboardSidebar() {
  return (
    <aside className="desktop-sidebar">
      <h2 className="desktop-sidebar__logo">MedSync</h2>

      <div className="desktop-sidebar__doctor">
        <img
          src="https://i.pravatar.cc/150?img=12"
          alt="Dr. Alejandro Sosa"
          className="desktop-sidebar__avatar"
        />

        <div>
          <strong>Dr. Alejandro Sosa</strong>
          <p>Cardiología</p>
        </div>
      </div>

      <nav className="desktop-sidebar__menu">
        <button className="active" type="button">
          <CalendarDays size={18} />
          Agenda
        </button>

        <button type="button">
          <Settings size={18} />
          Configuración
        </button>
      </nav>

      <button className="desktop-sidebar__new-turn" type="button">
        <Plus size={18} />
        Nuevo Turno
      </button>
    </aside>
  );
}

export { DashboardSidebar };
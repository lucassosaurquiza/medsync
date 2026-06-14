import "./styles.css";

function DashboardSidebar() {
  return (
    <aside className="desktop-sidebar">
      <h2 className="sidebar-logo">MedSync</h2>

      <div className="desktop-doctor">
        <div className="desktop-avatar"></div>

        <div>
          <strong>Dr. Alejandro Sosa</strong>
          <p>Cardiología</p>
        </div>
      </div>

      <nav className="desktop-menu">
        <button className="active">Agenda</button>
        <button>Configuración</button>
      </nav>

      <button className="desktop-new-turn">
        + Nuevo Turno
      </button>
    </aside>
  );
}

export { DashboardSidebar };
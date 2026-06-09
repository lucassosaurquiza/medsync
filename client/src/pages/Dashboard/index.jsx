import { NavBar } from "../../components/Navbar";
import { AppointmentCard } from "../../components/Appointment/AppointmentCard";
import { Footer } from "../../components/Footer";
import { DashboardSidebar } from "../../components/DashboardSidebar";
import { WeeklyAgenda } from "../../components/WeeklyAgenda";

import "./styles.css";

function Dashboard() {
  const appointments = [
    {
      time: "09:00",
      period: "AM",
      name: "Martina Rossi",
      detail: "Chequeo anual",
      active: true,
    },
    {
      time: "09:30",
      period: "AM",
      name: "Juan Pérez",
      detail: "Consulta post-quirúrgica",
      active: true,
    },
    {
      time: "10:00",
      period: "AM",
      name: "Cupo Libre",
      detail: "Disponible",
      active: false,
    },
  ];

  return (
    <>
      <NavBar className="mobile-navbar" />

      <main className="dashboard-layout">
        {/* MOBILE */}
        <section className="dashboard-content mobile-view">
          <div className="doctor-profile">
            <h2>Dr. Alejandro Sosa</h2>
            <p>Cardiología</p>
          </div>

          <section className="stats">
            <article className="stat-card">
              <span>HOY</span>
              <strong>12</strong>
              <p className="success">8 confirmados</p>
            </article>

            <article className="stat-card">
              <span>PENDIENTES</span>
              <strong>4</strong>
              <p className="danger">Revisar</p>
            </article>
          </section>

          <section className="agenda">
            <div className="agenda-header">
              <h3>Agenda Diaria</h3>
              <button>Ver todo</button>
            </div>

            <div className="appointment-list">
              {appointments.map((appointment, index) => (
                <AppointmentCard key={index} {...appointment} />
              ))}
            </div>
          </section>
        </section>

        {/* DESKTOP */}
        <section className="desktop-view">
          <DashboardSidebar />

          <section className="dashboard-main">
            <header className="desktop-header">
              <div>
                <h1>Panel de Control</h1>
                <p>Martes, 14 de Mayo, 2024</p>
              </div>

              <div className="desktop-stats">
                <article>
                  <span>HOY</span>
                  <strong>12 Turnos</strong>
                </article>

                <article>
                  <span>PENDIENTES</span>
                  <strong>4 Nuevos</strong>
                </article>
              </div>
            </header>

            <WeeklyAgenda />
          </section>

          <aside className="dashboard-aside">
            <section className="next-turn-card">
              <div className="next-turn-top">
                <span>Próximo Turno</span>
                <p>En 15 min</p>
              </div>

              <h3>Maria Paz</h3>
              <p>Control Post-Operatorio</p>

              <button>Confirmar Asistencia</button>
            </section>

            <section className="quick-actions">
              <h3>Acciones Rápidas</h3>
              <div>
                <button>Nuevo</button>
                <button>Bloquear</button>
              </div>
            </section>
          </aside>
        </section>
      </main>

      <button className="new-turn-button">+ Nuevo Turno</button>
      <Footer />
    </>
  );
}

export { Dashboard };
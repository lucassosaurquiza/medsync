import { NavBar } from "../../components/Navbar";
import { AppointmentCard } from "../../components/Appointment/AppointmentCard";
import { Footer } from "../../components/Footer";

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
          <aside className="desktop-sidebar">
            <h2>MedSync</h2>

            <div className="desktop-doctor">
              <div className="desktop-avatar" />
              <div>
                <strong>Dr. Alejandro Sosa</strong>
                <p>Cardiología</p>
              </div>
            </div>

            <nav className="desktop-menu">
              <button className="active">Agenda</button>
              <button>Configuración</button>
            </nav>

            <button className="desktop-new-turn">+ Nuevo Turno</button>
          </aside>

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

            <section className="weekly-agenda">
              <div className="weekly-header">
                <h2>Agenda Semanal</h2>
                <div>
                  <button>Semana</button>
                  <button>Día</button>
                </div>
              </div>

              <div className="weekly-grid">
                <span></span>
                <strong>Lun 13</strong>
                <strong>Mar 14</strong>
                <strong>Mié 15</strong>
                <strong>Jue 16</strong>
                <strong>Vie 17</strong>

                <span>09:00</span>
                <p>Luis Gomez</p>
                <p>Marta Paz</p>
                <p></p>
                <p>Ana Ruiz</p>
                <p></p>

                <span>10:00</span>
                <p></p>
                <p className="blocked">Bloqueado</p>
                <p>Pedro Sosa</p>
                <p></p>
                <p>Julia Fer</p>

                <span>11:00</span>
                <p>Carlos M.</p>
                <p></p>
                <p></p>
                <p>Raul H.</p>
                <p></p>
              </div>
            </section>
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
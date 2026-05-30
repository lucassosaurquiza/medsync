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
        <section className="dashboard-content">
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
                <AppointmentCard
                  key={index}
                  time={appointment.time}
                  period={appointment.period}
                  name={appointment.name}
                  detail={appointment.detail}
                  active={appointment.active}
                />
              ))}
            </div>
          </section>
        </section>
      </main>
      <button className="new-turn-button">+ Nuevo Turno</button>
      <Footer />
    </>
  );
}

export { Dashboard };
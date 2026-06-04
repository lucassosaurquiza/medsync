import "./styles.css";

function AppointmentCard({ time, period, name, detail, active }) {
  return (
    <article className={`appointment-card ${active ? "active" : "free"}`}>
      <div className="appointment-time">
        <strong>{time}</strong>
        <span>{period}</span>
      </div>

      <div className="appointment-info">
        <h4>{name}</h4>
        <p>{detail}</p>
      </div>

      {active ? (
        <span className="appointment-arrow">›</span>
      ) : (
        <button className="appointment-assign">Asignar</button>
      )}
    </article>
  );
}

export { AppointmentCard };

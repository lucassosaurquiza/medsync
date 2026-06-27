import "./styles.css";

function DashboardStats() {
  return (
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
  );
}

export { DashboardStats };
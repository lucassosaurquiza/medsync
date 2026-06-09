import "./styles.css";

function WeeklyAgenda() {
  return (
    <section className="weekly-agenda">
      <div className="weekly-header">
        <h2>Agenda Semanal</h2>

        <div className="weekly-view-buttons">
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
  );
}

export { WeeklyAgenda };
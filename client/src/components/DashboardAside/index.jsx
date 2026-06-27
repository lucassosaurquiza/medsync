import { CheckCircle, Plus, Ban } from "lucide-react";
import "./styles.css";

function DashboardAside() {
  return (
    <aside className="dashboard-aside">
      <section className="next-turn-card">
        <div className="next-turn-top">
          <span>Próximo Turno</span>
          <p>En 15 min</p>
        </div>

        <h3>María Paz</h3>
        <p>Control postoperatorio</p>

        <button type="button">
          <CheckCircle size={18} />
          Confirmar Asistencia
        </button>
      </section>

      <section className="quick-actions">
        <h3>Acciones Rápidas</h3>

        <div>
          <button type="button">
            <Plus size={18} />
            Nuevo
          </button>

          <button type="button">
            <Ban size={18} />
            Bloquear
          </button>
        </div>
      </section>
    </aside>
  );
}

export { DashboardAside };
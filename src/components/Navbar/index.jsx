import { IoNotificationsOutline } from "react-icons/io5";
import "./styles.css";


function NavBar() {
  return (
    <section className="navbar-container">
      <nav className="navbar">
        <h1 className="reserve-turn__title">MedSync</h1> {/*Cambia el ClassName para utilizar los mismos estilos del resto.*/}

        <div className="navbar-actions">
          <button className="notification-btn">
            <IoNotificationsOutline />
          </button>

          <img
            className="profile-image"
            src="https://i.pravatar.cc/150?img=12"
            alt="profile"
          />
        </div>
      </nav>
    </section>
  );
}

export { NavBar };
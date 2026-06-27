import { Check, MapPin, X } from 'lucide-react'
import { Link } from 'react-router-dom'

import './styles.css'

function AppointmentConfirmationModal ({ isOpen, onClose, appointment }) {
  if (!isOpen) return null

  return (
    <div className='appointment-modal'>
      <div className='appointment-modal__overlay' onClick={onClose} />

      <section className='appointment-modal__content'>
        <button className='appointment-modal__close' onClick={onClose}>
          <X size={20} />
        </button>

        <div className='appointment-modal__icon'>
          <Check size={28} />
        </div>

        <h2 className='appointment-modal__title'>Solicitud enviada</h2>

        <p className='appointment-modal__description'>
          El especialista recibio tu solicitud y debera confirmarla.
        </p>

        <div className='appointment-modal__body'>
          <div className='appointment-modal__summary'>
            <div className='appointment-modal__doctor'>
              <div className='appointment-modal__avatar'>
                {appointment.specialistInitial || 'D'}
              </div>

              <div>
                <span className='appointment-modal__label'>Profesional</span>
                <h3>{appointment.specialistName}</h3>
                <p>{appointment.specialty}</p>
              </div>
            </div>

            <div className='appointment-modal__divider' />

            <div className='appointment-modal__grid'>
              <div>
                <span className='appointment-modal__label'>Fecha</span>
                <strong>{appointment.date}</strong>
              </div>

              <div>
                <span className='appointment-modal__label'>Horario</span>
                <strong>{appointment.time}</strong>
              </div>

              <div className='appointment-modal__location'>
                <MapPin size={18} />
                <div>
                  <span className='appointment-modal__label'>Ubicacion</span>
                  <strong>{appointment.workplace}</strong>
                </div>
              </div>

              <div className='appointment-modal__payment'>
                <span className='appointment-modal__label'>Pago</span>
                <strong>No se paga desde MedSync.</strong>
                <p>
                  El precio de consulta se abona en el consultorio segun las
                  condiciones del profesional.
                </p>
              </div>
            </div>
          </div>

          <aside className='appointment-modal__actions'>
            <div className='appointment-modal__next'>
              <h3>Proximos pasos</h3>
              <p>La reserva queda pendiente hasta que el especialista la acepte.</p>
              <p>Vas a recibir una notificacion con su respuesta.</p>
            </div>

            <Link
              className='appointment-modal__button appointment-modal__button--primary'
              to='/my-appointments'
            >
              Ver mis turnos
            </Link>

            <button
              className='appointment-modal__button appointment-modal__button--secondary'
              type='button'
              onClick={onClose}
            >
              Cerrar
            </button>
          </aside>
        </div>
      </section>
    </div>
  )
}

export { AppointmentConfirmationModal }

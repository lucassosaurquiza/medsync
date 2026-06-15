import { CalendarPlus, Check, Download, MapPin, X } from 'lucide-react'

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

        <h2 className='appointment-modal__title'>¡Reserva Confirmada!</h2>

        <p className='appointment-modal__description'>
          Tu turno ha sido agendado exitosamente.
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
                  <span className='appointment-modal__label'>Ubicación</span>
                  <strong>{appointment.workplace}</strong>
                </div>
              </div>
            </div>
          </div>

          <aside className='appointment-modal__actions'>
            <div className='appointment-modal__next'>
              <h3>Próximos pasos</h3>
              <p>• Presentarse 15 minutos antes.</p>
              <p>• Traer credencial de prepaga y DNI.</p>
            </div>

            <button className='appointment-modal__button appointment-modal__button--primary'>
              <CalendarPlus size={18} />
              Agregar al calendario
            </button>

            <button className='appointment-modal__button appointment-modal__button--secondary'>
              <Download size={18} />
              Descargar PDF
            </button>
          </aside>
        </div>
      </section>
    </div>
  )
}

export { AppointmentConfirmationModal }
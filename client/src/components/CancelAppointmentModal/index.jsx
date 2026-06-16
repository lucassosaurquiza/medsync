import './styles.css'

import { CalendarX, X } from 'lucide-react'

function CancelAppointmentModal ({
  isOpen,
  appointment,
  onClose,
  onConfirm
}) {
  if (!isOpen || !appointment) return null

  return (
    <div className='cancel-modal'>
      <div className='cancel-modal__overlay' onClick={onClose} />

      <section className='cancel-modal__content'>
        <button className='cancel-modal__close' type='button' onClick={onClose}>
          <X size={20} />
        </button>

        <div className='cancel-modal__icon'>
          <CalendarX size={28} />
        </div>

        <h2 className='cancel-modal__title'>Cancelar turno</h2>

        <p className='cancel-modal__description'>
          ¿Estás seguro de que querés cancelar este turno?
        </p>

        <div className='cancel-modal__appointment'>
          <h3>
            Dr. {appointment.name} {appointment.lastName}
          </h3>

          <p>{appointment.specialty}</p>

          <div className='cancel-modal__details'>
            <span>📅 {appointment.formattedDate}</span>
            <span>🕒 {appointment.formattedTime} hs</span>
          </div>
        </div>

        <div className='cancel-modal__warning'>
          Al cancelar, este turno quedará marcado como cancelado y no podrá
          usarse nuevamente.
        </div>

        <div className='cancel-modal__actions'>
          <button
            className='cancel-modal__button cancel-modal__button--secondary'
            type='button'
            onClick={onClose}
          >
            Mantener turno
          </button>

          <button
            className='cancel-modal__button cancel-modal__button--danger'
            type='button'
            onClick={onConfirm}
          >
            Confirmar cancelación
          </button>
        </div>
      </section>
    </div>
  )
}

export { CancelAppointmentModal }
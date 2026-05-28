import './styles.css'

function SpecialistRegisterForm () {
  return (
    <form className='register-form'>
      <div className='register-form__group'>
        <label className='register-form__label'>Nombre completo</label>

        <input
          className='register-form__input'
          placeholder='Dr. Alejandro Rossi'
        />
      </div>

      <div className='register-form__group'>
        <label className='register-form__label'>Correo profesional</label>

        <input
          className='register-form__input'
          placeholder='doctor@clinica.com'
        />
      </div>

      <div className='register-form__group'>
        <label className='register-form__label'>Especialidad</label>

        <select className='register-form__select'>
          <option>Selecciona tu especialidad</option>
          <option>Cardiología</option>
          <option>Psicología</option>
          <option>Dermatología</option>
          <option>Pediatría</option>
          <option>Nutrición</option>
        </select>
      </div>

      <div className='register-form__group'>
        <label className='register-form__label'>Matrícula profesional</label>

        <input className='register-form__input' placeholder='MP 123456' />
      </div>

      <div className='register-form__group'>
        <label className='register-form__label'>Contraseña</label>

        <div className='register-form__password'>
          <input
            className='register-form__input'
            type='password'
            placeholder='Mínimo 8 caracteres'
          />
        </div>
      </div>

      <div className='register-form__group'>
        <label className='register-form__label'>Confirmar contraseña</label>

        <div className='register-form__password'>
          <input
            className='register-form__input'
            type='password'
            placeholder='Repite tu contraseña'
          />
        </div>
      </div>

      <button className='register-form__button' type='submit'>
        Crear cuenta
      </button>

      <p className='register-form__login'>
        ¿Ya tienes una cuenta? <a href='/login'>Inicia sesión</a>
      </p>
    </form>
  )
}

export { SpecialistRegisterForm }

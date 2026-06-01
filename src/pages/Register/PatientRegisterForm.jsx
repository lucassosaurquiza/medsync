import './styles.css'

function PatientRegisterForm () {
  return (
    <form className='register-form'>
      <div className='register-form__group'>
        <label className='register-form__label'>Nombre completo</label>

        <input className='register-form__input' placeholder='Ej. Juan Pérez' />
      </div>

      <div className='register-form__group'>
        <label className='register-form__label'>Correo electrónico</label>

        <input
          className='register-form__input'
          placeholder='nombre@ejemplo.com'
        />
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

export { PatientRegisterForm }

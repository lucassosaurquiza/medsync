import './styles.css'

import { Footer } from '../../components/Footer'
import { Link } from 'react-router-dom'
import { ArrowRight, Eye, Lock, Mail, BriefcaseMedical } from 'lucide-react'

function Login () {
  return (
    <>
      <section className='login'>
        <header className='login-header'>
          <div className='login-header__brand'>
            <BriefcaseMedical className='login-header__icon' />
            <h1 className='login-header__title'>MedSync</h1>
          </div>
        </header>

        <div className='login-card'>
          <h2 className='login-card__title'>Bienvenido de nuevo</h2>

          <p className='login-card__paragraph'>
            Ingresa tus credenciales para acceder a tu panel
          </p>

          <form className='login-form'>
            <div className='login-form__group'>
              <label className='login-form__label'>Correo electrónico</label>

              <div className='login-form__field'>
                <Mail className='login-form__icon' />

                <input
                  className='login-form__input'
                  type='email'
                  placeholder='ejemplo@medsync.com'
                />
              </div>
            </div>

            <div className='login-form__group'>
              <label className='login-form__label'>Contraseña</label>

              <div className='login-form__field'>
                <Lock className='login-form__icon' />

                <input
                  className='login-form__input'
                  type='password'
                  placeholder='••••••••'
                />

                <button className='login-form__eye' type='button'>
                  <Eye size={20} />
                </button>
              </div>
            </div>

            <Link className='login-form__forgot' to='/forgot-password'>
              ¿Olvidé mi contraseña?
            </Link>

            <button className='login-form__button' type='submit'>
              Ingresar
              <ArrowRight size={18} />
            </button>
          </form>
        </div>

        <p className='login-register'>
          ¿No tienes cuenta?{' '}
          <Link className='login-register__link' to='/register'>
            Regístrate
          </Link>
        </p>
      </section>
      <Footer />
    </>
  )
}

export { Login }

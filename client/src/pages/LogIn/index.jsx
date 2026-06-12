import './styles.css'

import toast from 'react-hot-toast'
import { useState } from 'react'
import { Footer } from '../../components/Footer'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, Lock, Mail, BriefcaseMedical } from 'lucide-react'

function Login () {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async event => {
    event.preventDefault()

    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password
      })
    })

    const data = await response.json()

    if (!response.ok) {
      toast.error(data.message)
      return
    }

    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))

    toast.success('Login exitoso')

    if (data.user.role === 'specialist') {
      navigate('/dashboard')
      return
    }

    navigate('/')
  }

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

          <form className='login-form' onSubmit={handleSubmit}>
            <div className='login-form__group'>
              <label className='login-form__label'>Correo electrónico</label>

              <div className='login-form__field'>
                <Mail className='login-form__icon' />

                <input
                  className='login-form__input'
                  type='email'
                  placeholder='ejemplo@medsync.com'
                  value={email}
                  onChange={event => setEmail(event.target.value)}
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
                  value={password}
                  onChange={event => setPassword(event.target.value)}
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

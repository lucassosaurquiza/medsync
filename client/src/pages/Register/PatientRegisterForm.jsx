import './styles.css'

import toast from 'react-hot-toast'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function PatientRegisterForm () {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmedPassword, setConfirmedPassword] = useState('')

  const handleSubmit = async event => {
    event.preventDefault()

    if (password !== confirmedPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    try {
      const registerResponse = await fetch(
        'http://localhost:3000/api/auth/register',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            password,
            role: 'patient'
          })
        }
      )

      const registerData = await registerResponse.json()

      if (!registerResponse.ok) {
        toast.error(registerData.message)
        return
      }

      await fetch('http://localhost:3000/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: registerData.id,
          phone: ''
        })
      })

      const loginResponse = await fetch(
        'http://localhost:3000/api/auth/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password
          })
        }
      )

      const loginData = await loginResponse.json()

      if (!loginResponse.ok) {
        toast.error(loginData.message)
        return
      }

      localStorage.setItem('token', loginData.token)
      localStorage.setItem('user', JSON.stringify(loginData.user))

      navigate('/')
    } catch {
      toast.error('Error al registrar paciente:')
    }
    
    toast.success('Cuenta creada correctamente')

    setTimeout(() => {
      navigate('/')
    }, 1000)
  }

  return (
    <form className='register-form' onSubmit={handleSubmit}>
      <div className='register-form__group'>
        <label className='register-form__label'>Nombre completo</label>

        <input
          className='register-form__input'
          placeholder='Ej. Juan Pérez'
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>

      <div className='register-form__group'>
        <label className='register-form__label'>Correo electrónico</label>

        <input
          className='register-form__input'
          placeholder='nombre@ejemplo.com'
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      </div>

      <div className='register-form__group'>
        <label className='register-form__label'>Contraseña</label>

        <div className='register-form__password'>
          <input
            className='register-form__input'
            type='password'
            placeholder='Mínimo 8 caracteres'
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete='new-password'
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
            value={confirmedPassword}
            onChange={e => setConfirmedPassword(e.target.value)}
            autoComplete='new-password'
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

import './styles.css'

import toast from 'react-hot-toast'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_URL } from '../../config/api'

function PatientRegisterForm () {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [lastName, setLastName] = useState('')
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
      const response = await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            lastName,
            email,
            password,
            role: 'patient',
            phone: '',
            dni: ''
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.message)
        return
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      toast.success('Cuenta creada correctamente')
      navigate('/')
    } catch {
      toast.error('Error al registrar paciente')
    }
  }

  return (
    <form className='register-form' onSubmit={handleSubmit}>
      <div className='register-form__group'>
        <label className='register-form__label'>Nombre</label>

        <input
          className='register-form__input'
          placeholder='Ej. Juan'
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>

      <div className='register-form__group'>
        <label className='register-form__label'>Apellido</label>

        <input
          className='register-form__input'
          placeholder='Ej. Perez'
          value={lastName}
          onChange={e => setLastName(e.target.value)}
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

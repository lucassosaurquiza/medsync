import './styles.css'

import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { API_URL } from '../../config/api'

function SpecialistRegisterForm () {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmedPassword, setConfirmedPassword] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [license, setLicense] = useState('')

  const handleSubmit = async event => {
    event.preventDefault()

    if (password !== confirmedPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    if (!specialty || specialty === 'Selecciona tu especialidad') {
      toast.error('Seleccioná una especialidad')
      return
    }

    if (!license.trim()) {
      toast.error('Ingresá tu matrícula profesional')
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
            role: 'specialist',
            specialty,
            professionalLicense: license,
            workplace: 'Consultorio a definir',
            avatarUrl: '',
            price: 0
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

      toast.success('Bienvenido a tu dashboard')
      navigate('/dashboard')
    } catch {
      toast.error('Error al registrar especialista')
    }
  }

  return (
    <form className='register-form' onSubmit={handleSubmit}>
      <div className='register-form__group'>
        <label className='register-form__label'>Nombre</label>

        <input
          className='register-form__input'
          placeholder='Ej. Alejandro'
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>

      <div className='register-form__group'>
        <label className='register-form__label'>Apellido</label>

        <input
          className='register-form__input'
          placeholder='Ej. Rossi'
          value={lastName}
          onChange={e => setLastName(e.target.value)}
        />
      </div>

      <div className='register-form__group'>
        <label className='register-form__label'>Correo profesional</label>

        <input
          className='register-form__input'
          placeholder='doctor@clinica.com'
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      </div>

      <div className='register-form__group'>
        <label className='register-form__label'>Especialidad</label>

        <select
          className='register-form__select'
          value={specialty}
          onChange={e => setSpecialty(e.target.value)}
        >
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

        <input
          className='register-form__input'
          placeholder='MP 123456'
          value={license}
          onChange={e => setLicense(e.target.value)}
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

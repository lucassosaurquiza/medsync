import './styles.css'

import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

function SpecialistRegisterForm () {
  const navigate = useNavigate()

  const [name, setName] = useState('')
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
            role: 'specialist'
          })
        }
      )

      const registerData = await registerResponse.json()

      if (!registerResponse.ok) {
        console.log(registerData.message)
        return
      }

      await fetch('http://localhost:3000/api/specialists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: registerData.id,
          specialty,
          workplace: license,
          avatarUrl: ''
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
        console.log(loginData.message)
        return
      }

      localStorage.setItem('token', loginData.token)
      localStorage.setItem('user', JSON.stringify(loginData.user))

      navigate('/dashboard')
    } catch {
      toast.error('Error al registrar especialista')
    }
    
    toast.success('Bienvenido a tu dashboard')

    setTimeout(() => {
      navigate('/dashboard')
    }, 1000)
  }

  return (
    <form className='register-form' onSubmit={handleSubmit}>
      <div className='register-form__group'>
        <label className='register-form__label'>Nombre completo</label>

        <input
          className='register-form__input'
          placeholder='Dr. Alejandro Rossi'
          value={name}
          onChange={e => setName(e.target.value)}
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

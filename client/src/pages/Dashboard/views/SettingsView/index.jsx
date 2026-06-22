import './styles.css'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { API_URL as API_BASE_URL } from '../../../../config/api'

const API_URL = `${API_BASE_URL}/api/specialists/me`

const emptyProfile = {
  name: '',
  lastName: '',
  specialty: '',
  professionalLicense: '',
  workplace: '',
  price: '',
  avatarUrl: ''
}

function SettingsHeader () {
  return (
    <header className='settings-view__header'>
      <div>
        <span className='settings-view__eyebrow'>Configuracion</span>
        <h1>Perfil profesional</h1>
        <p>Actualiza los datos que tus pacientes ven al reservar.</p>
      </div>
    </header>
  )
}

function SettingsView () {
  const [profile, setProfile] = useState(emptyProfile)
  const [originalProfile, setOriginalProfile] = useState(emptyProfile)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    const getProfile = async () => {
      try {
        setIsLoading(true)
        setLoadError('')

        const token = localStorage.getItem('token')
        const response = await fetch(API_URL, {
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'No se pudo cargar el perfil')
        }

        const nextProfile = {
          name: data.name || '',
          lastName: data.lastName || '',
          specialty: data.specialty || '',
          professionalLicense: data.professionalLicense || '',
          workplace: data.workplace || '',
          price: data.price ?? '',
          avatarUrl: data.avatarUrl || ''
        }

        setProfile(nextProfile)
        setOriginalProfile(nextProfile)
      } catch (error) {
        if (error.name !== 'AbortError') {
          setLoadError(error.message)
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    getProfile()

    return () => controller.abort()
  }, [reloadKey])

  const handleChange = event => {
    const { name, value } = event.target

    setProfile(currentProfile => ({
      ...currentProfile,
      [name]: value
    }))
  }

  const handleReset = () => {
    setProfile(originalProfile)
  }

  const handleSubmit = async event => {
    event.preventDefault()

    if (isSaving) return

    setIsSaving(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'No se pudo actualizar el perfil')
      }

      const nextProfile = {
        ...profile,
        ...data.profile
      }

      setProfile(nextProfile)
      setOriginalProfile(nextProfile)

      const storedUser = JSON.parse(localStorage.getItem('user'))

      if (storedUser) {
        localStorage.setItem(
          'user',
          JSON.stringify({
            ...storedUser,
            name: nextProfile.name,
            lastName: nextProfile.lastName
          })
        )
      }

      toast.success('Perfil actualizado correctamente')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <section className='settings-view'>
        <SettingsHeader />
        <div className='settings-view__state'>
          <h2>Cargando perfil...</h2>
        </div>
      </section>
    )
  }

  if (loadError) {
    return (
      <section className='settings-view'>
        <SettingsHeader />
        <div className='settings-view__state settings-view__state--error'>
          <h2>No pudimos cargar tu perfil</h2>
          <p>{loadError}</p>
          <button type='button' onClick={() => setReloadKey(key => key + 1)}>
            Reintentar
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className='settings-view'>
      <SettingsHeader />

      <form className='settings-form' onSubmit={handleSubmit}>
        <div className='settings-form__grid'>
          <label>
            Nombre
            <input
              name='name'
              type='text'
              value={profile.name}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Apellido
            <input
              name='lastName'
              type='text'
              value={profile.lastName}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Especialidad
            <input
              name='specialty'
              type='text'
              value={profile.specialty}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Matrícula profesional
            <input
              name='professionalLicense'
              type='text'
              value={profile.professionalLicense}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Consultorio
            <input
              name='workplace'
              type='text'
              value={profile.workplace}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Precio de consulta
            <input
              name='price'
              type='number'
              min='0'
              step='0.01'
              value={profile.price}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            URL de imagen
            <input
              name='avatarUrl'
              type='url'
              value={profile.avatarUrl}
              onChange={handleChange}
              placeholder='https://...'
            />
          </label>
        </div>

        <div className='settings-form__actions'>
          <button
            type='button'
            className='settings-form__secondary'
            onClick={handleReset}
            disabled={isSaving}
          >
            Descartar cambios
          </button>

          <button
            type='submit'
            className='settings-form__primary'
            disabled={isSaving}
          >
            {isSaving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </section>
  )
}

export { SettingsView }

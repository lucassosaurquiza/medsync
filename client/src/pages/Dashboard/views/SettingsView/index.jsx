import './styles.css'

import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { API_URL as API_BASE_URL } from '../../../../config/api'

const API_URL = `${API_BASE_URL}/api/specialists/me`
const MAX_AVATAR_SIZE = 5 * 1024 * 1024

const emptyProfile = {
  name: '',
  lastName: '',
  specialty: '',
  professionalLicense: '',
  workplace: '',
  price: '',
  avatarUrl: '',
  healthInsurances: []
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
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const avatarInputRef = useRef(null)

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
          avatarUrl: data.avatarUrl || '',
          healthInsurances: Array.isArray(data.healthInsurances)
            ? data.healthInsurances
            : []
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

  const handleHealthInsuranceChange = (index, value) => {
    setProfile(currentProfile => ({
      ...currentProfile,
      healthInsurances: currentProfile.healthInsurances.map(
        (healthInsurance, healthInsuranceIndex) => (
          healthInsuranceIndex === index ? value : healthInsurance
        )
      )
    }))
  }

  const addHealthInsurance = () => {
    setProfile(currentProfile => ({
      ...currentProfile,
      healthInsurances: [...currentProfile.healthInsurances, '']
    }))
  }

  const removeHealthInsurance = index => {
    setProfile(currentProfile => ({
      ...currentProfile,
      healthInsurances: currentProfile.healthInsurances.filter(
        (_, healthInsuranceIndex) => healthInsuranceIndex !== index
      )
    }))
  }

  const handleAvatarChange = event => {
    const file = event.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('El archivo debe ser una imagen')
      return
    }

    if (file.size > MAX_AVATAR_SIZE) {
      toast.error('La imagen no puede superar los 5MB')
      return
    }

    setAvatarFile(file)

    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview)
    }

    setAvatarPreview(URL.createObjectURL(file))
  }

  const openAvatarSelector = () => {
    avatarInputRef.current?.click()
  }

  const handleReset = () => {
    setProfile(originalProfile)
    setAvatarFile(null)

    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview)
      setAvatarPreview('')
    }
  }

  useEffect(() => () => {
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview)
    }
  }, [avatarPreview])

  const handleSubmit = async event => {
    event.preventDefault()

    if (isSaving) return

    setIsSaving(true)

    try {
      const token = localStorage.getItem('token')
      let profileToSave = {
        ...profile,
        healthInsurances: profile.healthInsurances
          .map(healthInsurance => healthInsurance.trim())
          .filter(Boolean)
      }

      if (avatarFile) {
        const formData = new FormData()
        formData.append('avatar', avatarFile)

        const avatarResponse = await fetch(`${API_URL}/avatar`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        })
        const avatarData = await avatarResponse.json()

        if (!avatarResponse.ok) {
          throw new Error(avatarData.message || 'No se pudo subir la imagen')
        }

        profileToSave = {
          ...profile,
          healthInsurances: profileToSave.healthInsurances,
          avatarUrl: avatarData.avatarUrl
        }
      }

      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profileToSave)
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'No se pudo actualizar el perfil')
      }

      const nextProfile = {
        ...profileToSave,
        ...data.profile
      }

      setProfile(nextProfile)
      setOriginalProfile(nextProfile)
      setAvatarFile(null)

      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview)
        setAvatarPreview('')
      }

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

          <section className='settings-form__health-insurances'>
            <div className='settings-form__section-header'>
              <div>
                <h2>Obras sociales</h2>
                <p>Agrega las coberturas con las que trabajas.</p>
              </div>

              <button
                type='button'
                className='settings-form__add'
                onClick={addHealthInsurance}
              >
                +
              </button>
            </div>

            {profile.healthInsurances.length === 0 ? (
              <p className='settings-form__empty-list'>
                Todavia no agregaste obras sociales. Se mostrara Particular por defecto.
              </p>
            ) : (
              <div className='settings-form__dynamic-list'>
                {profile.healthInsurances.map((healthInsurance, index) => (
                  <div className='settings-form__dynamic-row' key={index}>
                    <input
                      type='text'
                      value={healthInsurance}
                      onChange={event =>
                        handleHealthInsuranceChange(index, event.target.value)}
                      placeholder='Ej: OSDE, Swiss Medical, Galeno'
                      maxLength={100}
                    />

                    <button
                      type='button'
                      className='settings-form__remove'
                      onClick={() => removeHealthInsurance(index)}
                      aria-label='Eliminar obra social'
                    >
                      Quitar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className='settings-form__avatar'>
            <div className='settings-form__avatar-preview'>
              {avatarPreview || profile.avatarUrl ? (
                <img
                  src={avatarPreview || profile.avatarUrl}
                  alt='Foto profesional'
                />
              ) : (
                <span>{profile.name?.charAt(0).toUpperCase() || 'M'}</span>
              )}
            </div>

            <label className='settings-form__avatar-upload'>
              Foto profesional
              <input
                ref={avatarInputRef}
                className='settings-form__avatar-input'
                type='file'
                accept='image/*'
                onChange={handleAvatarChange}
              />
              <div className='settings-form__avatar-controls'>
                <button
                  type='button'
                  className='settings-form__avatar-button'
                  onClick={openAvatarSelector}
                >
                  Cambiar foto
                </button>

                <span>
                  {avatarFile?.name ||
                    (profile.avatarUrl ? 'Imagen cargada' : 'Sin imagen')}
                </span>
              </div>
              <small>JPG, PNG o WebP. Maximo 5MB.</small>
            </label>
          </div>
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

import './styles.css'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Trash2 } from 'lucide-react'
import { API_URL as API_BASE_URL } from '../../../../config/api'

const API_URL = `${API_BASE_URL}/api/availability/me`
const BLOCKS_API_URL = `${API_BASE_URL}/api/blocks/me`

const weekDays = [
  { dayOfWeek: 1, label: 'Lunes' },
  { dayOfWeek: 2, label: 'Martes' },
  { dayOfWeek: 3, label: 'Miercoles' },
  { dayOfWeek: 4, label: 'Jueves' },
  { dayOfWeek: 5, label: 'Viernes' },
  { dayOfWeek: 6, label: 'Sabado' },
  { dayOfWeek: 7, label: 'Domingo' }
]

const createEmptyDays = () => weekDays.map(day => ({
  ...day,
  enabled: false,
  startTime: '09:00',
  endTime: '17:00'
}))

const cloneAvailability = availability => ({
  appointmentDuration: availability.appointmentDuration,
  days: availability.days.map(day => ({ ...day }))
})

const normalizeTime = time => time?.slice(0, 5) || ''

const getMinutes = time => {
  const [hours, minutes] = time.split(':').map(Number)
  return (hours * 60) + minutes
}

const createEmptyBlock = () => ({
  blockedDate: '',
  blockType: 'fullDay',
  startTime: '09:00',
  endTime: '10:00',
  reason: ''
})

const getTodayValue = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const formatBlockDate = value => {
  const [year, month, day] = value.split('-').map(Number)

  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(year, month - 1, day))
}

const sortBlocks = blocks => [...blocks].sort((firstBlock, secondBlock) => {
  const firstValue = `${firstBlock.blockedDate}-${firstBlock.startTime || ''}`
  const secondValue = `${secondBlock.blockedDate}-${secondBlock.startTime || ''}`

  return firstValue.localeCompare(secondValue)
})

function AvailabilityHeader () {
  return (
    <header className='availability-view__header'>
      <span className='availability-view__eyebrow'>Agenda semanal</span>
      <h1>Disponibilidad</h1>
      <p>Defini los dias y horarios en los que recibis pacientes.</p>
    </header>
  )
}

function AvailabilityView () {
  const [availability, setAvailability] = useState({
    appointmentDuration: 30,
    days: createEmptyDays()
  })
  const [originalAvailability, setOriginalAvailability] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [availabilityError, setAvailabilityError] = useState('')
  const [availabilityReloadKey, setAvailabilityReloadKey] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [blocks, setBlocks] = useState([])
  const [blockForm, setBlockForm] = useState(createEmptyBlock)
  const [isBlocksLoading, setIsBlocksLoading] = useState(true)
  const [blocksError, setBlocksError] = useState('')
  const [blocksReloadKey, setBlocksReloadKey] = useState(0)
  const [isCreatingBlock, setIsCreatingBlock] = useState(false)
  const [deletingBlockId, setDeletingBlockId] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    const getAvailability = async () => {
      try {
        setIsLoading(true)
        setAvailabilityError('')

        const token = localStorage.getItem('token')
        const response = await fetch(API_URL, {
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'No se pudo cargar la disponibilidad')
        }

        const configuredDays = new Map(
          data.days.map(day => [day.dayOfWeek, day])
        )
        const nextAvailability = {
          appointmentDuration: data.appointmentDuration ?? 30,
          days: createEmptyDays().map(day => {
            const configuredDay = configuredDays.get(day.dayOfWeek)

            if (!configuredDay) return day

            return {
              ...day,
              enabled: true,
              startTime: normalizeTime(configuredDay.startTime),
              endTime: normalizeTime(configuredDay.endTime)
            }
          })
        }

        setAvailability(nextAvailability)
        setOriginalAvailability(cloneAvailability(nextAvailability))
      } catch (error) {
        if (error.name !== 'AbortError') {
          setAvailabilityError(error.message)
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    getAvailability()

    return () => controller.abort()
  }, [availabilityReloadKey])

  useEffect(() => {
    const controller = new AbortController()

    const getBlocks = async () => {
      try {
        setIsBlocksLoading(true)
        setBlocksError('')

        const token = localStorage.getItem('token')
        const response = await fetch(BLOCKS_API_URL, {
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'No se pudieron cargar los bloqueos')
        }

        setBlocks(sortBlocks(data))
      } catch (error) {
        if (error.name !== 'AbortError') {
          setBlocksError(error.message)
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsBlocksLoading(false)
        }
      }
    }

    getBlocks()

    return () => controller.abort()
  }, [blocksReloadKey])

  const handleDurationChange = event => {
    setAvailability(current => ({
      ...current,
      appointmentDuration: Number(event.target.value)
    }))
  }

  const handleDayChange = (dayOfWeek, field, value) => {
    setAvailability(current => ({
      ...current,
      days: current.days.map(day => (
        day.dayOfWeek === dayOfWeek
          ? { ...day, [field]: value }
          : day
      ))
    }))
  }

  const handleReset = () => {
    if (originalAvailability) {
      setAvailability(cloneAvailability(originalAvailability))
    }
  }

  const validateAvailability = () => {
    const invalidDay = availability.days.find(day => {
      if (!day.enabled) return false

      const availableMinutes = getMinutes(day.endTime) - getMinutes(day.startTime)
      return availableMinutes < availability.appointmentDuration
    })

    if (invalidDay) {
      throw new Error(
        `${invalidDay.label}: el rango debe permitir al menos un turno completo`
      )
    }
  }

  const handleSubmit = async event => {
    event.preventDefault()

    if (isSaving) return

    try {
      validateAvailability()
      setIsSaving(true)

      const token = localStorage.getItem('token')
      const payload = {
        appointmentDuration: availability.appointmentDuration,
        days: availability.days
          .filter(day => day.enabled)
          .map(({ dayOfWeek, startTime, endTime }) => ({
            dayOfWeek,
            startTime,
            endTime
          }))
      }
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'No se pudo guardar la disponibilidad')
      }

      setOriginalAvailability(cloneAvailability(availability))
      toast.success('Disponibilidad actualizada correctamente')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleBlockFormChange = event => {
    const { name, value } = event.target

    setBlockForm(current => ({
      ...current,
      [name]: value
    }))
  }

  const handleBlockTypeChange = blockType => {
    setBlockForm(current => ({
      ...current,
      blockType
    }))
  }

  const handleCreateBlock = async event => {
    event.preventDefault()

    if (isCreatingBlock) return

    setIsCreatingBlock(true)

    try {
      const token = localStorage.getItem('token')
      const payload = {
        blockedDate: blockForm.blockedDate,
        reason: blockForm.reason
      }

      if (blockForm.blockType === 'range') {
        payload.startTime = blockForm.startTime
        payload.endTime = blockForm.endTime
      }

      const response = await fetch(BLOCKS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'No se pudo crear el bloqueo')
      }

      setBlocks(current => sortBlocks([...current, data.block]))
      setBlockForm(createEmptyBlock())
      toast.success('Bloqueo creado correctamente')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsCreatingBlock(false)
    }
  }

  const handleDeleteBlock = async blockId => {
    if (deletingBlockId !== null) return

    setDeletingBlockId(blockId)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${BLOCKS_API_URL}/${blockId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'No se pudo eliminar el bloqueo')
      }

      setBlocks(current => current.filter(block => block.id !== blockId))
      toast.success('Bloqueo eliminado correctamente')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setDeletingBlockId(null)
    }
  }

  if (isLoading) {
    return (
      <section className='availability-view'>
        <AvailabilityHeader />
        <div className='availability-view__state'>
          <h2>Cargando disponibilidad...</h2>
        </div>
      </section>
    )
  }

  if (availabilityError) {
    return (
      <section className='availability-view'>
        <AvailabilityHeader />
        <div className='availability-view__state availability-view__state--error'>
          <h2>No pudimos cargar tu disponibilidad</h2>
          <p>{availabilityError}</p>
          <button
            type='button'
            onClick={() => setAvailabilityReloadKey(key => key + 1)}
          >
            Reintentar
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className='availability-view'>
      <AvailabilityHeader />

      <form className='availability-form' onSubmit={handleSubmit}>
        <div className='availability-form__duration'>
          <div>
            <h2>Duracion de los turnos</h2>
            <p>Se aplica a todos los horarios de tu agenda.</p>
          </div>

          <label>
            Minutos
            <input
              type='number'
              min='10'
              max='240'
              step='5'
              value={availability.appointmentDuration}
              onChange={handleDurationChange}
              disabled={isSaving}
              required
            />
          </label>
        </div>

        <div className='availability-form__days'>
          {availability.days.map(day => (
            <div
              className={
                day.enabled
                  ? 'availability-day availability-day--enabled'
                  : 'availability-day'
              }
              key={day.dayOfWeek}
            >
              <label className='availability-day__toggle'>
                <input
                  type='checkbox'
                  checked={day.enabled}
                  onChange={event => handleDayChange(
                    day.dayOfWeek,
                    'enabled',
                    event.target.checked
                  )}
                  disabled={isSaving}
                />
                <span>{day.label}</span>
              </label>

              <div className='availability-day__times'>
                <label>
                  Desde
                  <input
                    type='time'
                    value={day.startTime}
                    onChange={event => handleDayChange(
                      day.dayOfWeek,
                      'startTime',
                      event.target.value
                    )}
                    disabled={!day.enabled || isSaving}
                    required={day.enabled}
                  />
                </label>

                <label>
                  Hasta
                  <input
                    type='time'
                    value={day.endTime}
                    onChange={event => handleDayChange(
                      day.dayOfWeek,
                      'endTime',
                      event.target.value
                    )}
                    disabled={!day.enabled || isSaving}
                    required={day.enabled}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>

        <div className='availability-form__actions'>
          <button
            type='button'
            className='availability-form__secondary'
            onClick={handleReset}
            disabled={isSaving || !originalAvailability}
          >
            Descartar cambios
          </button>

          <button
            type='submit'
            className='availability-form__primary'
            disabled={isSaving}
          >
            {isSaving ? 'Guardando...' : 'Guardar disponibilidad'}
          </button>
        </div>
      </form>

      <section className='blocks-section'>
        <header className='blocks-section__header'>
          <div>
            <h2>Bloqueos puntuales</h2>
            <p>Reserva dias u horarios en los que no vas a atender.</p>
          </div>
        </header>

        {!isBlocksLoading && !blocksError && (
          <form className='block-form' onSubmit={handleCreateBlock}>
          <label className='block-form__field'>
            Fecha
            <input
              name='blockedDate'
              type='date'
              min={getTodayValue()}
              value={blockForm.blockedDate}
              onChange={handleBlockFormChange}
              disabled={isCreatingBlock}
              required
            />
          </label>

          <fieldset className='block-form__type'>
            <legend>Tipo de bloqueo</legend>
            <div className='block-form__segments'>
              <button
                type='button'
                className={
                  blockForm.blockType === 'fullDay'
                    ? 'block-form__segment block-form__segment--active'
                    : 'block-form__segment'
                }
                onClick={() => handleBlockTypeChange('fullDay')}
                disabled={isCreatingBlock}
              >
                Dia completo
              </button>
              <button
                type='button'
                className={
                  blockForm.blockType === 'range'
                    ? 'block-form__segment block-form__segment--active'
                    : 'block-form__segment'
                }
                onClick={() => handleBlockTypeChange('range')}
                disabled={isCreatingBlock}
              >
                Rango horario
              </button>
            </div>
          </fieldset>

          <div className='block-form__times'>
            {blockForm.blockType === 'range' && (
              <>
                <label className='block-form__field'>
                  Desde
                  <input
                    name='startTime'
                    type='time'
                    value={blockForm.startTime}
                    onChange={handleBlockFormChange}
                    disabled={isCreatingBlock}
                    required
                  />
                </label>

                <label className='block-form__field'>
                  Hasta
                  <input
                    name='endTime'
                    type='time'
                    value={blockForm.endTime}
                    onChange={handleBlockFormChange}
                    disabled={isCreatingBlock}
                    required
                  />
                </label>
              </>
            )}
          </div>

          <label className='block-form__field block-form__reason'>
            Motivo opcional
            <input
              name='reason'
              type='text'
              maxLength='255'
              placeholder='Ej. Congreso, tramite personal...'
              value={blockForm.reason}
              onChange={handleBlockFormChange}
              disabled={isCreatingBlock}
            />
          </label>

          <button
            type='submit'
            className='block-form__submit'
            disabled={isCreatingBlock}
          >
            {isCreatingBlock ? 'Bloqueando...' : 'Agregar bloqueo'}
          </button>
          </form>
        )}

        <div className='blocks-list'>
          {isBlocksLoading && (
            <p className='blocks-list__status'>Cargando bloqueos...</p>
          )}

          {!isBlocksLoading && blocksError && (
            <div className='blocks-list__status blocks-list__status--error'>
              <strong>No pudimos cargar los bloqueos</strong>
              <span>{blocksError}</span>
              <button
                type='button'
                onClick={() => setBlocksReloadKey(key => key + 1)}
              >
                Reintentar
              </button>
            </div>
          )}

          {!isBlocksLoading && !blocksError && blocks.length === 0 && (
            <div className='blocks-list__empty'>
              <strong>No tenes bloqueos proximos</strong>
              <span>Las excepciones que agregues apareceran aca.</span>
            </div>
          )}

          {!isBlocksLoading && !blocksError && blocks.map(block => (
            <article className='block-item' key={block.id}>
              <div className='block-item__details'>
                <strong>{formatBlockDate(block.blockedDate)}</strong>
                <span>
                  {block.startTime && block.endTime
                    ? `${block.startTime} a ${block.endTime}`
                    : 'Dia completo'}
                </span>
                {block.reason && <p>{block.reason}</p>}
              </div>

              <button
                type='button'
                className='block-item__delete'
                onClick={() => handleDeleteBlock(block.id)}
                disabled={deletingBlockId !== null}
                aria-label={`Eliminar bloqueo del ${formatBlockDate(block.blockedDate)}`}
                title='Eliminar bloqueo'
              >
                <Trash2 size={18} />
              </button>
            </article>
          ))}
        </div>
      </section>
    </section>
  )
}

export { AvailabilityView }

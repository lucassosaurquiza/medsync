import './styles.css'

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'

import { MainLayout } from '../../layouts/MainLayout'
import { API_URL } from '../../config/api'

const categories = [
  'Todos',
  'Cardiología',
  'Dermatología',
  'Pediatría',
  'Ginecología',
  'Neurología',
  'Nutrición',
  'Traumatología'
]

function ReserveYourTurn () {
  const navigate = useNavigate()

  const [specialists, setSpecialists] = useState([])
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [sortBy, setSortBy] = useState('relevance')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const getSpecialists = async () => {
      try {
        setIsLoading(true)
        setError('')

        const params = new URLSearchParams()

        if (search.trim()) {
          params.append('search', search.trim())
        }

        if (selectedCategory !== 'Todos') {
          params.append('specialty', selectedCategory)
        }

        params.append('sortBy', sortBy)

        const response = await fetch(
          `${API_URL}/api/specialists?${params.toString()}`
        )

        if (!response.ok) {
          throw new Error('No se pudieron obtener los especialistas')
        }

        const data = await response.json()

        console.log('Especialistas desde API:', data)
        setSpecialists(data)
      } catch (error) {
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    getSpecialists()
  }, [search, selectedCategory, sortBy])

  const handleReserve = specialistId => {
    navigate(`/reserve-turn/${specialistId}`)
  }

  return (
    <>
      <Header />
      <MainLayout>
        <main className='reserve-turn'>
          <section className='reserve-turn__hero'>
            <h1 className='reserve-turn__title'>Encontrá a tu especialista</h1>

            <div className='reserve-turn__search'>
              <div className='reserve-turn__search-box'>
                <span className='reserve-turn__search-icon'>⌕</span>

                <input
                  className='reserve-turn__search-input'
                  type='text'
                  placeholder='Buscar por nombre o especialidad...'
                  value={search}
                  onChange={event => setSearch(event.target.value)}
                />
              </div>

            </div>

            <div className='reserve-turn__categories'>
              {categories.map(category => (
                <button
                  key={category}
                  className={
                    selectedCategory === category
                      ? 'reserve-turn__category reserve-turn__category--active'
                      : 'reserve-turn__category'
                  }
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </section>

          <section className='reserve-turn__specialists'>
            <div className='reserve-turn__specialists-header'>
              <p className='reserve-turn__results'>
                {isLoading
                  ? 'Buscando especialistas...'
                  : `Se encontraron ${specialists.length} especialistas disponibles`}
              </p>

              <label className='reserve-turn__sort'>
                Ordenar por:
                <select
                  className='reserve-turn__sort-select'
                  value={sortBy}
                  onChange={event => setSortBy(event.target.value)}
                >
                  <option value='relevance'>Más relevantes</option>
                  <option value='rating'>Mejor valorados</option>
                  <option value='lowerPrice'>Menor precio</option>
                  <option value='higherPrice'>Mayor precio</option>
                </select>
              </label>
            </div>

            {error && <p className='reserve-turn__error'>{error}</p>}

            {!isLoading && specialists.length === 0 && !error && (
              <p className='reserve-turn__empty'>
                No se encontraron especialistas disponibles.
              </p>
            )}

            <div className='reserve-turn__grid'>
              {specialists.map(specialist => (
                <article
                  className='specialist-card'
                  key={specialist.id || specialist._id}
                >
                  <div className='specialist-card__image-wrapper'>
                    <img
                      className='specialist-card__image'
                      src={
                        specialist.avatarUrl ||
                        'https://placehold.co/400x400?text=Especialista'
                      }
                      alt={`${specialist.name} ${specialist.lastName}`}
                    />
                  </div>

                  <div className='specialist-card__content'>
                    <h3 className='specialist-card__name'>
                      {specialist.name} {specialist.lastName}
                    </h3>

                    <p className='specialist-card__specialty'>
                      {specialist.specialty}
                    </p>

                    <p className='specialist-card__license'>
                      Matrícula {specialist.professionalLicense}
                    </p>

                    <div className='specialist-card__location'>
                      <span className='specialist-card__location-icon'>📍</span>
                      <p className='specialist-card__location-text'>
                        {specialist.workplace}
                      </p>
                    </div>

                    <strong className='specialist-card__price'>
                      ${Number(specialist.price).toLocaleString('es-AR')} ARS
                    </strong>

                    <button
                      className='specialist-card__button'
                      onClick={() =>
                        handleReserve(specialist.id || specialist._id)
                      }
                    >
                      Ver disponibilidad
                    </button>
                  </div>
                </article>
              ))}
            </div>

          </section>
        </main>
      </MainLayout>

      <Footer />
    </>
  )
}

export { ReserveYourTurn }

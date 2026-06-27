import './styles.css'

function SpecialistProfile ({ specialist }) {
  const fullName = `${specialist.name || ''} ${specialist.lastName || ''}`.trim()
  const initial = specialist.name?.charAt(0).toUpperCase() || 'E'

  return (
    <section className='profile'>
      <div className='profile__container'>
        {specialist.avatarUrl
          ? (
            <img
              className='profile__img'
              src={specialist.avatarUrl}
              alt={`Foto de ${fullName}`}
            />
            )
          : (
            <div className='profile__fallback' aria-hidden='true'>
              {initial}
            </div>
            )}

        <div className='profile__details'>
          <h2 className='profile__subtitle'>{fullName}</h2>
          <p className='profile__specialist'>
            {specialist.specialty}
            {specialist.workplace && ` - ${specialist.workplace}`}
          </p>
          {specialist.professionalLicense && (
            <span className='profile__license'>
              Matricula {specialist.professionalLicense}
            </span>
          )}
        </div>
      </div>
    </section>
  )
}

export { SpecialistProfile }

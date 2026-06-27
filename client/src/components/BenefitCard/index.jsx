import './styles.css'

function BenefitCard ({ icon, title, description }) {
  return (
    <article className='benefit-card'>
      <div className='benefit-card__icon'>{icon}</div>

      <h3 className='benefit-card__title'>{title}</h3>

      <p className='benefit-card__description'>{description}</p>
    </article>
  )
}

export { BenefitCard }

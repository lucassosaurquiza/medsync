import './styles.css'
import kinesiologoImg from '../../assets/kinesiologo.png'

function SpecialistProfile () {
  return (
    <>
      <section className='profile'>
        <div className='profile__container'>
          <img className='profile__img' src={kinesiologoImg} alt='' />
          <div className='profile__details'>
            <h2 className='profile__subtitle'>Dr.Alejandro Sosa</h2>
            <p className='profile__specialist'>
              Cardiologia - Hospital Central
            </p>
          </div>
        </div>
      </section>
    </>
  )
}

export { SpecialistProfile }

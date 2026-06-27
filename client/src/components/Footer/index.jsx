import './styles.css'

function Footer () {
  return (
    <footer className='site-footer'>
      <h2 className='site-footer__title'>MedSync</h2>
      <p className='site-footer__info'>
        © 2024 MedSync Argentina. Tecnología para la salud.
      </p>
      <p className='site-footer__paragraph'>
        Creado por
        <a
          className='site-footer__link'
          href='https://obxel.vercel.app/'
          target='_blank'
          rel='noopener noreferrer'
        >
          Obxel
        </a>
        <span>y</span>
        <a
          className='site-footer__link'
          href='https://martin2197.github.io/Martin-portfolio/'
          target='_blank'
          rel='noopener noreferrer'
        >
          Martin Villalba
        </a>
      </p>
    </footer>
  )
}

export { Footer }

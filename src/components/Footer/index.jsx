import './styles.css'

function Footer () {
  return (
    <section className='footer'>
      <h2 class='footer__title'>MedSync</h2>
      <p className='footer__info'>© 2024 MedSync Argentina. Tecnología para la salud.</p>
      <p className='footer__paragraph'>Creado por 
        <a className='footer__obxel' href="https://obxel.vercel.app/" target="_blank" rel="noopener noreferrer">Obxel</a>
      </p>
    </section>
  )
}

export { Footer }

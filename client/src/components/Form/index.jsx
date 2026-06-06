import './styles.css'

function Form () {
  return (
    <>
      <section className='data'>
        <h2 className='data-subtitle'>TUS DATOS</h2>
        <form className='data-form' action=''>
          <label className='data-form__label' for='name'>
            Nombre Completo
          </label>
          <input className='data-form__input' type='text' />
          <label className='data-form__label' for='name'>
            DNI
          </label>
          <input className='data-form__input' type='text' />
          <label className='data-form__label' for='name'>
            Obra Social / Prepaga
          </label>
          <select className='data-form__select' id='obra-social'></select>
          <label className='data-form__label' htmlFor=''>Motivo de consulta (Opcional)</label>
          <textarea className='data-form__description' name='' id='' placeholder='Breve Descripcion...'></textarea>
        </form>
      </section>
    </>
  )
}

export { Form }

import './styles.css'

function Form ({ formData, setFormData }) {
  const handleChange = event => {
    const { name, value } = event.target

    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }))
  }

  return (
    <>
      <h1 className='data-title'>1 - COMPLETA CON TUS DATOS</h1>

      <section className='data'>
        <h2 className='data-subtitle'>TUS DATOS</h2>

        <form className='data-form'>
          <label className='data-form__label' htmlFor='fullName'>
            Nombre Completo
          </label>

          <input
            className='data-form__input'
            id='fullName'
            name='fullName'
            type='text'
            value={formData.fullName}
            onChange={handleChange}
          />

          <label className='data-form__label' htmlFor='dni'>
            DNI
          </label>

          <input
            className='data-form__input'
            id='dni'
            name='dni'
            type='text'
            value={formData.dni}
            onChange={handleChange}
          />

          <label className='data-form__label' htmlFor='healthInsurance'>
            Obra Social / Prepaga
          </label>

          <select
            className='data-form__select'
            id='healthInsurance'
            name='healthInsurance'
            value={formData.healthInsurance}
            onChange={handleChange}
          >
            <option value=''>Seleccionar</option>
            <option value='Particular'>Particular</option>
            <option value='OSDE'>OSDE</option>
            <option value='Swiss Medical'>Swiss Medical</option>
            <option value='Galeno'>Galeno</option>
            <option value='Medifé'>Medifé</option>
          </select>

          <label className='data-form__label' htmlFor='reason'>
            Motivo de consulta
          </label>

          <textarea
            className='data-form__description'
            id='reason'
            name='reason'
            placeholder='Breve descripción...'
            value={formData.reason}
            onChange={handleChange}
          />
        </form>
      </section>
    </>
  )
}

export { Form }

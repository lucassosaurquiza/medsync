import './styles.css'


function AccountTypeSelector ({ accountType, setAccountType }) {
  return (
    <div className='account-type-selector'>
      <button
        type='button'
        className={accountType === 'patient' ? 'active' : ''}
        onClick={() => setAccountType('patient')}
      >
        Soy paciente
      </button>

      <button
        type='button'
        className={accountType === 'specialist' ? 'active' : ''}
        onClick={() => setAccountType('specialist')}
      >
        Soy especialista
      </button>
    </div>
  )
}

export { AccountTypeSelector }

import './styles.css'

import { Link } from 'react-router-dom'

function RegisterButton () {
  return (
    <>
        <Link className='register-button' to='/register'>Registrarse</Link>
    </>
  )
}

export { RegisterButton }

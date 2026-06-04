import './styles.css'

import { Link } from 'react-router-dom'

function LoginButton () {
  return (
    <>
        <Link className='login-button' to='/Login'>
          Ingresar
        </Link>
    </>
  )
}

export { LoginButton }

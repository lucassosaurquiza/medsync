import './styles.css'
import { Link } from 'react-router-dom'

function StartButton () {
  return (
    <>
      <Link className='start-button' to='/register'>Comenzar ahora</Link>
    </>
  )
}

export { StartButton }

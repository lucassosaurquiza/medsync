import './styles.css'
import { Link } from 'react-router-dom'

function ButtonChoosePlan () {
  return (
    <>
      <Link className='choose-plan' to='/register'>Crear cuenta</Link>
    </>
  )
}
export { ButtonChoosePlan }

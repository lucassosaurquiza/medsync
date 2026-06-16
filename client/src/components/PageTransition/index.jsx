import './styles.css'

function PageTransition ({ children }) {
  console.log('ANIMACION EJECUTADA')

  return (
    <div key={window.location.pathname} className='page-transition'>
      {children}
    </div>
  )
}

export { PageTransition }

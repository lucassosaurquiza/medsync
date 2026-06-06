import './styles.css'

function MainLayout({ children }) {
  return (
    <main className='container'>
      {children}
    </main>
  )
}

export { MainLayout }
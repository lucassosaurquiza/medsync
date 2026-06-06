import './styles.css'

import { useState } from 'react'
import { Timer } from 'lucide-react'
import { PatientRegisterForm } from './PatientRegisterForm'
import { SpecialistRegisterForm } from './SpecialistRegisterForm'
import { MainLayout } from '../../layouts/MainLayout'
import { AccountTypeSelector } from './AccountTypeSelector'
import { Footer } from '../../components/Footer'

function Register () {
  const [accountType, setAccountType] = useState('patient')

  return (
    <>
      <MainLayout>
        <section className='register'>
          <header className='register-header'>
            <div className='register-header__container'>
              <Timer className='register-header__icon' />
            </div>
          </header>
          <h1 className='register-header__title'>MedSync</h1>
          <h2 className='register-header__subtitle'>Crea tu cuenta</h2>
          <p className='register-header__paragraph'>
            Saca una cita con tu especialista en segundos
          </p>
          <AccountTypeSelector
            accountType={accountType}
            setAccountType={setAccountType}
          />
          {accountType === 'patient' ? (
            <PatientRegisterForm />
          ) : (
            <SpecialistRegisterForm />
          )}
        </section>
      </MainLayout>
      <Footer />
    </>
  )
}

export { Register }

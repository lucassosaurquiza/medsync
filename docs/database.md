# Base de datos MedSync

## Entidades

### User

- id
- name
- email
- password
- role

### Specialist

- id
- userId
- specialty
- workplace
- avatarUrl

### Patient

- id
- userId
- phone

### Appointment

- id
- specialistId
- patientId
- date
- time
- status
# Base de datos MedSync

## Entidades

### User

- id:INT, primary key
- name: VARCHAR(100)
- email: VARCHAR(150), unique
- password: VARCHAR(255)
- role: ENUM(', 'specialist', 'admin')

### Specialist

- id: INT, primary key
- userId: INT, foreign -> User.id
- specialty: VARCHAR(100)
- workplace: VARCHAR(100)
- avatarUrl: VARCHAR(255)

### Patient

- id: INT, primary key
- userId: INT, foreign key -> User.id
- phone: VARCHAR(30)

### Appointment

- id: INT, primary key
- specialistId: INT, foreign key -> Specialist.id
- patientId: INT, foreign key -> Patient.id
- date: DATE
- time: TIME
- status: ENUM('pending', 'confirmed', 'cancelled')

## Relaciones

- Un User puede ser un Specialist.
- Un User puede ser un Patient.
- Un Specialist puede tener muchos Appointments.
- Un Patient puede tener muchos Appointments.
- Un Appointment pertenece a un Specialist.
- Un Appointment pertenece a un Patient.
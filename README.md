# Hospital Appointment Management System

A web-based application for managing hospital patients, doctors, appointments, and administrative tasks.

## Features

- Admin login and authentication
- Patient record management
- Doctor management
- Appointment booking and management
- Search and filtering
- Appointment reports
- Dashboard interface

## Technologies Used

- **Frontend:** React, Vite, HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** JWT

## Project Structure

```text
HospitalAppointmentSystem/
├── backend/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── seedAdmin.js
├── web/
│   └── src/
├── .gitignore
└── README.md
```

## Prerequisites

- Node.js and npm
- MongoDB
- Git

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/Likhith04-u/HospitalAppointmentSystem.git
cd HospitalAppointmentSystem
```

### 2. Start the backend

```bash
cd backend
npm install
```

Configure the required environment variables in `backend/.env` according to your backend code. Do not upload this file to GitHub.

Start the backend using the start command defined in `backend/package.json`.

### 3. Start the frontend

Open a second terminal from the project root and run:

```bash
cd web
npm install
npm run dev
```

Open the local URL shown in the terminal.

## Security

Never publish database credentials, administrator passwords, or JWT secrets.

## Future Enhancements

- Appointment reminders
- Patient self-service booking
- Advanced reporting and analytics
- Cloud deployment

## Author

Likhith

## GitHub Repository

https://github.com/Likhith04-u/HospitalAppointmentSystem

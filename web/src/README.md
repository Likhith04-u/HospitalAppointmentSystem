
# Hospital Appointment Management System

A web-based hospital appointment management application built using React, Node.js, Express.js, and MongoDB.

## Features

- Admin login and authentication
- Patient management
- Doctor management
- Appointment booking and status updates
- Appointment search and filtering
- Appointment reports
- CSV report export
- Responsive dashboard

## Technology Stack

- Frontend: React and Vite
- Backend: Node.js and Express.js
- Database: MongoDB
- Authentication: JSON Web Token (JWT)
- Version control: Git and GitHub

## Prerequisites

- Node.js and npm
- MongoDB
- Git

## Run the Project Locally

### 1. Start the backend

Open a terminal:

```powershell
cd backend
npm install
node server.js
```

Configure your local `backend/.env` file with your MongoDB connection string, port, and required authentication secret.

### 2. Start the frontend

Open a second terminal:

```powershell
cd web
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

## Security

Do not upload `.env` files, passwords, JWT secrets, database credentials, or other private information.

## Project Status

Developed as an academic AAT-II project.

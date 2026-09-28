<div align="center">

<img src="client/public/icon-512.png" width="120" alt="HostelGo Logo">

# HostelGo 
### Digital Hostel Management System


Registration · Payment Verification · Room Allocation · Digital Pass · QR Access


![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)

</div>


## Overview

HostelGo is a full-stack digital hostel management system designed for VTU PG Centre, Mysuru.

The system brings student registration, hostel payment submission, payment verification, room and bed allocation, digital hostel passes, and gate access verification into a single application.

Students can register, submit payment details, track their verification status, view their hostel allocation, and use a digital QR pass for hostel access. Wardens can manage payments, occupancy, rooms, beds, and maintenance requests, while gate staff can scan digital passes and verify access in real time.


## Why HostelGo?

Hostel management involves several connected processes such as registration, payment verification, room allocation, and access control.

HostelGo connects these workflows through a single role-based system.

```text
Student Registration
        ↓
Payment Submission
        ↓
Payment Verification
        ↓
Room & Bed Allocation
        ↓
Digital Hostel Pass
        ↓
QR-Based Gate Verification
```



## Screenshots

### 1. Landing Page

<p align="center">
  <img src="docs/screenshots/landing-page.png" width="900" alt="HostelGo Landing Page">
</p>

### 2. Student Page

<p align="center">
  <img src="docs/screenshots/student-page.png" width="900" alt="HostelGo Student Page">
</p>

### 3. Warden Page

<p align="center">
  <img src="docs/screenshots/warden-page.png" width="900" alt="HostelGo Warden Page">
</p>

### 4. Login

<p align="center">
  <img src="docs/screenshots/login.png" width="850" alt="HostelGo Login Page">
</p>

### 5. Registration

<p align="center">
  <img src="docs/screenshots/registration.png" width="850" alt="HostelGo Registration Page">
</p>



## Features

### Student

- Registration and login
- Profile management
- Hostel payment submission
- VTU rent reference submission
- Payment receipt PDF upload
- Mess DD payment details
- Payment verification status
- Digital hostel pass
- Signed and rotating QR code
- Room and bed information
- Maintenance ticket submission and tracking

### Warden

- Hostel occupancy dashboard
- Total, occupied, and available beds
- Block-wise hostel information
- Pending payment overview
- Rent payment verification
- Mess-DD payment verification
- Room and bed allocation
- UG/PG category-based allocation
- Payment-status-based allocation
- Maintenance ticket management

### Gate Staff

- Camera-based QR scanner
- QR-based hostel access verification

### Admin

- Initial administrator bootstrap
- Staff account provisioning
- Warden account management
- Gate-staff account management
- Staff management through the application

### Platform

- Progressive Web App
- Installable on supported devices
- Offline-capable application shell
- Mobile home-screen installation
- Responsive interface
- Role-based access control
- Server-side authorization
- JWT-based authentication
- Protected application routes


## Technology Stack

<table>
<tr>

<td align="center" width="170">
<img src="https://skillicons.dev/icons?i=javascript" width="60"><br>
<b>JavaScript</b>
</td>

<td align="center" width="170">
<img src="https://skillicons.dev/icons?i=react" width="60"><br>
<b>React</b>
</td>

<td align="center" width="170">
<img src="https://skillicons.dev/icons?i=vite" width="60"><br>
<b>Vite</b>
</td>

<td align="center" width="170">
<img src="https://skillicons.dev/icons?i=nodejs" width="60"><br>
<b>Node.js</b>
</td>

</tr>

<tr>

<td align="center">
<img src="https://skillicons.dev/icons?i=express" width="60"><br>
<b>Express 5</b>
</td>

<td align="center">
<img src="https://skillicons.dev/icons?i=mongodb" width="60"><br>
<b>MongoDB Atlas</b>
</td>

<td align="center">
<img src="https://skillicons.dev/icons?i=git" width="60"><br>
<b>Git</b>
</td>

<td align="center">
<img src="https://skillicons.dev/icons?i=github" width="60"><br>
<b>GitHub</b>
</td>

</tr>
</table>

### Core Technologies

| Layer | Technology |
|----------|------------|
| Frontend | React, Vite, React Router |
| API Communication | Axios |
| QR Generation | qrcode.react |
| QR Scanning | html5-qrcode |
| PWA | vite-plugin-pwa |
| Backend | Node.js, Express 5 |
| Database | MongoDB Atlas |
| ODM | Mongoose |
| Authentication | JWT |
| Password Security | bcrypt |
| File Uploads | Multer |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |



## System Architecture

```mermaid
flowchart TB

    subgraph USERS["Users"]
        STUDENT["Student"]
        WARDEN["Warden"]
        GATE["Gate Staff"]
        ADMIN["Admin"]
    end

    subgraph FRONTEND["Frontend"]
        UI["React + Vite"]
        ROUTER["React Router"]
        AUTH["Auth Context"]
        PWA["Progressive Web App"]
    end

    subgraph BACKEND["Backend"]
        API["Express 5 API"]
        AUTHN["JWT Authentication"]
        RBAC["Role-Based Access Control"]
        MW["Security & Upload Middleware"]
        ROUTES["REST API Routes"]
        CTRL["Controllers"]
    end

    subgraph SERVICES["Core Services"]
        REG["Registration"]
        PAY["Payment Verification"]
        ALLOC["Room & Bed Allocation"]
        PASS["Digital QR Pass"]
        ACCESS["Access Verification"]
        MAINT["Maintenance"]
        STAFF["Staff Management"]
        OCCUPANCY["Occupancy"]
    end

    DB[("MongoDB Atlas")]

    STUDENT --> UI
    WARDEN --> UI
    GATE --> UI
    ADMIN --> UI

    UI --> ROUTER
    UI --> AUTH
    UI --> PWA
    ROUTER --> API

    API --> AUTHN
    API --> RBAC
    API --> MW
    API --> ROUTES
    ROUTES --> CTRL

    CTRL --> REG
    CTRL --> PAY
    CTRL --> ALLOC
    CTRL --> PASS
    CTRL --> ACCESS
    CTRL --> MAINT
    CTRL --> STAFF
    CTRL --> OCCUPANCY

    REG --> DB
    PAY --> DB
    ALLOC --> DB
    PASS --> DB
    ACCESS --> DB
    MAINT --> DB
    STAFF --> DB
    OCCUPANCY --> DB

    PASS --> ACCESS
    GATE -. QR Scan .-> ACCESS
```



## Hostel & Access Flow

```mermaid
flowchart LR

    A["Student Registration"]
    B["Login"]
    C["Payment Submission"]
    D["Payment Verification"]
    E["Room & Bed Allocation"]
    F["Digital Hostel Pass"]
    G["Signed QR Code"]
    H["Gate Scanner"]
    I{"Pass Valid?"}
    J["Access Granted"]
    K["Access Denied"]

    A --> B
    B --> C
    C --> D

    D -->|Verified| E
    D -->|Rejected| R["Resubmission Currently Not Supported"]

    E --> F
    F --> G
    G --> H
    H --> I

    I -->|Yes| J
    I -->|No| K
```



## Role-Based Access

```mermaid
flowchart TB

    LOGIN["User Login"] --> ROLE{"User Role"}

    ROLE --> STUDENT["Student"]
    ROLE --> WARDEN["Warden"]
    ROLE --> GATE["Gate Staff"]
    ROLE --> ADMIN["Admin"]

    STUDENT --> S1["Profile"]
    STUDENT --> S2["Payments"]
    STUDENT --> S3["Digital Pass"]
    STUDENT --> S4["Maintenance"]

    WARDEN --> W1["Payments"]
    WARDEN --> W2["Rooms & Beds"]
    WARDEN --> W3["Occupancy"]
    WARDEN --> W4["Maintenance"]

    GATE --> G1["QR Scanner"]
    GATE --> G2["Access Verification"]

    ADMIN --> A1["Manage Staff"]
```



## Application Modules

| Module | Description |
|----------|-------------|
| Student Registration | Student account creation and profile management |
| Payment Management | Rent and mess-DD payment submission and verification |
| Hostel Allocation | Room and bed allocation based on payment and UG/PG eligibility |
| Digital Pass | Digital hostel pass with signed QR code |
| Gate Access | QR validation and real-time access decisions |
| Maintenance | Maintenance ticket submission and tracking |
| Staff Management | Warden and gate-staff account management |
| Occupancy Management | Block, room, and bed occupancy information |



## Security

HostelGo applies authentication and authorization at the application and API levels.

| Feature | Description |
|----------|-------------|
| JWT Authentication | Protects authenticated API requests |
| Role-Based Access Control | Restricts resources according to user role |
| Password Hashing | Passwords are hashed using bcrypt |
| Login Rate Limiting | Limits repeated login attempts |
| Signed QR Passes | QR passes use server-side signature validation |
| Protected Routes | Authentication and authorization are enforced on the server |
| File Validation | Uploaded payment receipts are validated |
| Upload Limits | Restricts uploaded file size |
| Environment Variables | Sensitive configuration is kept outside source code |

> **Security:** Never commit `.env` files, database credentials, JWT secrets, QR signing secrets, passwords, API keys, or private deployment credentials to the repository.



## Project Structure

```text
HostelGo/
│
├── client/                              # React + Vite frontend
│   ├── public/                          # Static assets and PWA resources
│   │   ├── icon-192.png
│   │   ├── icon-512.png
│   │   └── ...
│   │
│   └── src/
│       ├── api/                         # Axios instance and API configuration
│       ├── components/                  # Reusable UI components
│       ├── context/                     # Authentication state
│       └── pages/                       # Application pages and routes
│
├── server/                              # Express 5 backend
│   ├── config/                          # Database configuration
│   ├── controllers/                     # Request and business logic
│   ├── middleware/                      # Authentication, roles, rate limiting, uploads
│   ├── models/                          # Mongoose models
│   ├── routes/                          # REST API routes
│   ├── utils/                           # Validators and utilities
│   ├── scripts/                         # Setup and seed scripts
│   │   ├── seedStaff.js
│   │   ├── seedRooms.js
│   │   └── getTokens.js
│   └── server.js                        # Backend entry point
│
├── docs/
│   └── screenshots/                     # README screenshots
│       ├── landing-page.png
│       ├── student-page.png
│       ├── warden-page.png
│       ├── login.png
│       └── registration.png
│
└── README.md
```



## Getting Started

### Prerequisites

- Node.js 20+
- npm
- Git
- MongoDB Atlas or local MongoDB

### Clone Repository

```bash
git clone https://github.com/shyampillai07/HostelGo.git
cd HostelGo
```

### Install Backend

```bash
cd server
npm install
```

### Install Frontend

```bash
cd ../client
npm install
```



## Environment Variables

Create `server/.env`:

```env
NODE_ENV=development
PORT=5000

MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>

JWT_ACCESS_SECRET=<long-random-secret>
JWT_ACCESS_EXPIRES_IN=8h

CLIENT_ORIGIN=http://localhost:5173

BCRYPT_SALT_ROUNDS=12

LOGIN_RATE_LIMIT_WINDOW_MIN=15
LOGIN_RATE_LIMIT_MAX_ATTEMPTS=10

UPLOAD_MAX_MB=5

QR_SIGNING_SECRET=<different-long-random-secret>
```

Create `client/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Generate a random secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Use separate secrets for `JWT_ACCESS_SECRET` and `QR_SIGNING_SECRET`.



## Run Locally

### Backend

```bash
cd server
node server.js
```

API:

```text
http://localhost:5000
```

### Frontend

Open another terminal:

```bash
cd client
npm run dev
```

Application:

```text
http://localhost:5173
```



## Staff Account Bootstrap

Only students can self-register through the application.

The first administrator can be provisioned through the CLI:

```bash
cd server

node scripts/seedStaff.js \
  --role ADMIN \
  --staffId <staff-id> \
  --name "<admin-name>" \
  --email <admin-email> \
  --phone <admin-phone> \
  --password "<temporary-password>"
```

After the initial administrator is created, warden and gate-staff accounts can be managed through **Manage Staff** in the application.

Do not commit real staff credentials to the repository.



## Hostel Inventory

Hostel room and bed inventory can optionally be populated using:

```bash
cd server
node scripts/seedRooms.js
```



## API

### Health Check

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/health` | API health check |

Production:

```text
https://HostelGo.onrender.com/api/health
```

Other application routes are organized under the backend `routes/` and `controllers/` directories.



## Deployment

### Backend

```text
Platform: Render
Service: Node Web Service
Root Directory: server/
Start Command: node server.js
```

### Frontend

```text
Platform: Vercel
Root Directory: client/
Framework: Vite
```

### Database

```text
Database: MongoDB Atlas
ODM: Mongoose
```


## Known Limitations

- Render's free tier uses ephemeral storage, so uploaded payment receipt PDFs may not persist after a cold restart.
- Production file uploads should use dedicated object storage rather than local server storage.
- An automated test suite has not yet been implemented.
- Current application flows have been verified manually.
- Payment resubmission after rejection is not currently supported for the same academic year.
- Bed release and transfer functionality is not yet implemented.
- Comprehensive audit logging is not yet implemented.



## License

This project is licensed under the [GNU General Public License v2.0](LICENSE).



## Contact

<p align="left">

<a href="mailto:shyam.m.pillai71@gmail.com">
<img src="https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white" alt="Email">
</a>

<a href="https://linkedin.com/in/shyampillai07">
<img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn">
</a>

</p>

For questions, feedback, or collaboration opportunities, feel free to reach out.

# 🎓 PlaceME - Campus Placement Management System

<div align="center">

![PlaceME Banner](./images/image.png)

**A comprehensive full-stack placement management system designed to streamline campus recruitment processes**

[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Usage](#-usage) • [API Docs](#-api-documentation) • [Contributing](#-contributing)

</div>

---

## 📋 Overview

**PlaceME** is a modern, scalable placement management system built with the MERN stack. It simplifies the entire recruitment workflow for educational institutions, providing separate interfaces for students, companies, and administrators.

### 🎯 Key Highlights

- **500+** Students can register and apply simultaneously
- **Real-time** Application tracking and status updates
- **Role-based** Access control for Students, Companies & Admins
- **Automated** Email notifications and reminders
- **Responsive** Design for seamless mobile experience

---

## ✨ Features

### 👨‍🎓 For Students
- ✅ User-friendly registration and profile management
- 📝 Apply to multiple job postings with one click
- 📊 Track application status in real-time
- 📄 Upload and manage resume/documents
- 🔍 Advanced job search and filtering

### 🏢 For Companies
- 📢 Post job openings with detailed requirements
- 👥 View and manage applicant pool
- ✔️ Shortlist candidates efficiently
- 📈 Analytics dashboard for recruitment metrics

### 🔐 For Administrators
- 🎛️ Comprehensive admin dashboard
- 👤 User management (Students & Companies)
- 📊 Generate placement reports and statistics
- 🔧 System configuration and settings
---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library with hooks
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS / Material-UI** - Styling
- **Vite** - Build tool for faster development

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication & authorization
- **bcrypt** - Password hashing
- **Nodemailer** - Email service

### Additional Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **dotenv** - Environment variable management

---

## 🚀 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5.0 or higher)
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/Atharv42/PlaceME.git
cd PlaceME
```

### 2. Install Dependencies

#### Install Backend Dependencies
```bash
npm install
```

#### Install Frontend Dependencies
```bash
cd client
npm install
cd ..
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/placeme
# OR for MongoDB Atlas
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/placeme

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Frontend URL
CLIENT_URL=http://localhost:5173
```

### 4. Database Setup

Make sure MongoDB is running:

```bash
# For local MongoDB
mongod

# The application will automatically create necessary collections
```

### 5. Run the Application

#### Development Mode (Both Frontend & Backend)
```bash
npm run dev
```

#### Or Run Separately

**Backend:**
```bash
npm run server
```

**Frontend:**
```bash
cd client
npm run dev
```

The application will be available at:
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:5000

---

## 📖 Usage

### User Roles

1. **Student**
   - Register with college email
   - Complete profile with academic details
   - Browse and apply to job postings
   - Track application status

2. **Company**
   - Register company profile
   - Post job requirements
   - Review applications
   - Shortlist candidates

3. **Admin**
   - Full system access
   - Manage users and companies
   - Configure placement drives
   - Generate reports

---

## 🏗️ Project Structure

```
PlaceME/
|
src/
├── client/                  # Frontend React application
│   ├── public/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── context/        # Context API
│   │   ├── utils/          # Helper functions
│   │   └── App.jsx         # Main app component
│   └── package.json
│
├── server/                  # Backend Node.js application
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── utils/              # Helper functions
│   └── server.js           # Entry point
│
├── .env                    # Environment variables
├── .gitignore
├── package.json
└── README.md
```

---

## 🔌 API Documentation

### Authentication Endpoints

```http
POST /api/auth/register      # User registration
POST /api/auth/login         # User login
GET  /api/auth/me            # Get current user
POST /api/auth/logout        # User logout
```

### Student Endpoints

```http
GET    /api/students         # Get all students (Admin)
GET    /api/students/:id     # Get student by ID
PUT    /api/students/:id     # Update student profile
DELETE /api/students/:id     # Delete student (Admin)
```

### Company Endpoints

```http
GET    /api/companies        # Get all companies
GET    /api/companies/:id    # Get company by ID
POST   /api/companies        # Create company (Admin)
PUT    /api/companies/:id    # Update company
DELETE /api/companies/:id    # Delete company (Admin)
```

### Job Endpoints

```http
GET    /api/jobs             # Get all jobs
GET    /api/jobs/:id         # Get job by ID
POST   /api/jobs             # Create job posting (Company/Admin)
PUT    /api/jobs/:id         # Update job
DELETE /api/jobs/:id         # Delete job
```

### Application Endpoints

```http
GET    /api/applications          # Get all applications
POST   /api/applications          # Apply to job
PUT    /api/applications/:id      # Update application status
DELETE /api/applications/:id      # Withdraw application
```

> 📚 For detailed API documentation with request/response examples, visit `/api/docs` (if Swagger is configured)

---

## 👨‍💻 Author

**Atharv Trivedi**

- GitHub: [@Atharv42](https://github.com/Atharv42)
- LinkedIn: [Atharv Trivedi](https://linkedin.com/in/atharv-trivedi)
- Email: trivediatharv0402@gmail.com

---

## 📞 Support

If you have any questions or need help, feel free to:

- Open an [Issue](https://github.com/Atharv42/PlaceME/issues)
- Email: trivediatharv0402@gmail.com
- Join our [Discussions](https://github.com/Atharv42/PlaceME/discussions)

---

<div align="center">

**If you found this project helpful, please give it a ⭐!**

Made with ❤️ by [Atharv Trivedi](https://github.com/Atharv42)
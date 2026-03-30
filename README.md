# CSSE Super Student App

<p align="center">
  <img src="./public/au-logo.png" alt="Andhra University Logo" width="120" />
</p>

<p align="center">
  <strong>A Comprehensive Attendance & Student Management System</strong><br>
  Andhra University - Department of Computer Science & Systems Engineering (CSSE)
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#screenshots">Screenshots</a> •
  <a href="#deployment">Deployment</a>
</p>

---

## Overview

CSSE Super Student App is a 360-degree tool designed for teachers and administrators to manage student attendance, track compliance, and generate official documentation. Built for the Department of CSSE at Andhra University, this application streamlines academic operations with modern web technologies.

**Live Demo:** [https://csse-super-students.vercel.app](https://csse-super-students.vercel.app)

---

## Features

### Dual Portal System

#### Admin/Faculty Portal
- **Dashboard**: Analytics, attendance reports, and statistics
- **Attendance Management**:
  - Manual attendance marking
  - AI-powered Face Recognition attendance using TensorFlow.js
- **Timetable**: View complete class schedule
- **Assignments**: Create, edit, and manage student assignments
- **Letters**: Generate official documents (bonafide, permission, etc.)
- **Alerts**: Email notifications for students below 75% attendance

#### Student Portal
- **Dashboard**: Personal attendance overview
- **My Attendance**: View detailed attendance records
- **Timetable**: View class schedule
- **Assignments**: View active and past assignments
- **Letters**: Request and generate official documents
- **Profile**: Student information and details

### Key Features

| Feature | Description |
|---------|-------------|
| 🔐 **Authentication** | Secure login for both admins and students |
| 🎯 **Face Recognition** | AI-powered attendance using TensorFlow.js and Teachable Machine |
| 📊 **Analytics** | Real-time attendance statistics and reports |
| 📧 **Email Alerts** | Automatic notifications for low attendance (<75%) |
| 📝 **Assignment Management** | CRUD operations for assignments with due dates |
| 📄 **Letter Generation** | Generate official university documents |
| 🌓 **Dark/Light Mode** | Theme toggle with system preference support |
| 📱 **Responsive Design** | Mobile-first approach for all devices |
| 🎨 **Animated Preloader** | Custom Andhra University branded loading screen |

---

## Tech Stack

### Frontend
- **Framework**: [Next.js](https://nextjs.org/) 16.2.0 (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) 4.x
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)

### AI/ML
- **Face Recognition**: [TensorFlow.js](https://www.tensorflow.org/js) with Custom Teachable Machine Model
- **Model**: Trained for 4 people (Somesh, Deepesh, Balu, Susheel)

### Analytics
- **Web Analytics**: [Vercel Analytics](https://vercel.com/analytics)

### Deployment
- **Platform**: [Vercel](https://vercel.com/)
- **Package Manager**: pnpm

---

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- pnpm (recommended) or npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Sampath0411/CSSE-Super-Students.git
   cd CSSE-Super-Students
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Run the development server**
   ```bash
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
pnpm build
```

---

## Test Credentials

### Admin/Faculty Login
| Email | Password |
|-------|----------|
| aneela@andhrauniversity.edu.in | admin123 |

### Student Login
| Registration/Roll Number | Password |
|--------------------------|----------|
| 3235064022211 | Student123 |
| 22212 | Student123 |

> **Note:** Default password for all students is `Student123`

---

## Project Structure

```
CSSE-Super-Students/
├── app/                      # Next.js App Router
│   ├── (dashboard)/          # Admin routes (grouped)
│   │   ├── attendance/       # Manual attendance page
│   │   ├── face-attendance/  # Face recognition page
│   │   ├── assignments/      # Assignment management
│   │   ├── timetable/        # Timetable view
│   │   ├── letters/          # Letter generation
│   │   ├── alerts/           # Email alerts
│   │   └── layout.tsx        # Admin layout
│   ├── (student)/            # Student routes (grouped)
│   │   ├── student/
│   │   │   ├── attendance/   # Student attendance view
│   │   │   ├── assignments/  # Student assignments
│   │   │   ├── timetable/    # Student timetable
│   │   │   ├── letters/      # Student letters
│   │   │   └── profile/      # Student profile
│   │   └── layout.tsx        # Student layout
│   ├── login/                # Login page
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/               # React components
│   ├── ui/                   # shadcn/ui components
│   ├── app-sidebar.tsx       # Admin sidebar
│   ├── preloader.tsx         # Loading animation
│   ├── theme-provider.tsx    # Theme context
│   └── theme-toggle.tsx      # Theme switcher
├── lib/                      # Utility functions
│   ├── data.ts               # Student/teacher data
│   ├── attendance-store.ts   # Attendance state
│   └── email-service.ts      # Email functionality
├── models/                   # AI/ML models
│   └── face-detection/       # TensorFlow models
├── public/                   # Static assets
│   └── au-logo.png           # Andhra University logo
├── package.json
├── pnpm-lock.yaml
└── README.md
```

---

## Screenshots

### Login Page
<p align="center">
  <em>Dual login system for students and faculty</em>
</p>

### Admin Dashboard
<p align="center">
  <em>Analytics and attendance overview</em>
</p>

### Face Recognition
<p align="center">
  <em>AI-powered attendance marking</em>
</p>

### Assignments
<p align="center">
  <em>Create and manage assignments</em>
</p>

---

## Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Sampath0411/CSSE-Super-Students)

1. Push your code to GitHub
2. Import your repository on Vercel
3. Deploy with a single click

### Environment Variables

No environment variables are required for basic deployment. The app uses in-memory data storage.

---

## Features in Detail

### Face Recognition Attendance
- Uses TensorFlow.js with a custom Teachable Machine model
- 85% confidence threshold for accurate recognition
- Supports 4 trained individuals
- Real-time face detection and attendance marking

### Email Alerts
- Automatically triggered when attendance falls below 75%
- 24-hour cooldown to prevent spam
- Displays sent email history
- Lists at-risk students

### Assignment Management
- CRUD operations (Create, Read, Update, Delete)
- Due date tracking with overdue indicators
- Subject-wise organization
- Active/closed status management

### Theme Toggle
- Light mode, Dark mode, and System preference
- Persistent theme selection
- Smooth transitions between themes

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## Acknowledgments

- **Institution**: Andhra University, Visakhapatnam
- **Department**: Computer Science & Systems Engineering (CSSE)
- **Batch**: 3/6 B.Tech (CSE)-4, II Semester - Room A33

---

## Contact

**Developer**: Sampath Satya Saran
**Email**: sampathlox@gmail.com
**GitHub**: [@Sampath0411](https://github.com/Sampath0411)

---

<p align="center">
  Made with ❤️ for Andhra University CSSE Department
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.2.0-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind" />
  <img src="https://img.shields.io/badge/TensorFlow.js-4.22-FF6F00?style=for-the-badge&logo=tensorflow" alt="TensorFlow.js" />
</p>

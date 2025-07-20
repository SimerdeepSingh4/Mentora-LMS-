# Mentora Learning Platform

A comprehensive online learning platform built with the MERN stack (MongoDB, Express.js, React, Node.js).

## 🌟 Project Overview

Mentora is a feature-rich learning platform that connects instructors and students, offering interactive courses, quizzes, and real-time progress tracking.

## 🏗 Project Structure

```
mentora/
├── client/          # React frontend application
├── server/          # Express.js backend API
└── docker-compose.yml  # Docker composition for development
```

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mentora
   ```

2. **Setup Backend**
   ```bash
   cd server
   npm install
   cp .env.example .env    # Configure your environment variables
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd client
   npm install
   cp .env.example .env    # Configure your environment variables
   npm run dev
   ```

4. **Using Docker (Optional)**
   ```bash
   docker-compose up
   ```

## 📚 Documentation

- [Frontend Documentation](./client/README.md)
- [Backend Documentation](./server/README.md)

## 🛠 Tech Stack

### Frontend
- React.js 18+
- Vite
- TailwindCSS
- Redux Toolkit
- Shadcn UI

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication


# Task Management System Setup Guide

## Overview
This is a complete Task Management System built with React and Firebase, featuring role-based access control, task assignment, and real-time updates.

## Features
- **Firebase Authentication** with role-based access
- **Admin Dashboard**: Create users, assign tasks, manage deadlines
- **User Dashboard**: View assigned tasks, update task status
- **Firestore Database** with optimized queries
- **Professional UI** with Tailwind CSS and shadcn/ui components

## Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication and Firestore Database

### 2. Configure Firebase
Replace the configuration in `src/lib/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### 3. Firestore Database Rules
Set up the following security rules in Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read their own data, admins can read all
    match /users/{userId} {
      allow read: if request.auth != null && 
        (request.auth.uid == userId || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Tasks can be read by assigned users and admins
    match /tasks/{taskId} {
      allow read: if request.auth != null && 
        (resource.data.assignedTo == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      allow update: if request.auth != null && 
        (resource.data.assignedTo == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
  }
}
```

### 4. Authentication Setup
1. Enable Email/Password authentication in Firebase Console
2. Create initial admin user manually in Firebase Console
3. Add user document in Firestore users collection:

```json
{
  "id": "user-auth-id",
  "name": "Admin User",
  "email": "admin@taskmanager.com",
  "role": "admin"
}
```

## Database Structure

### Users Collection
```typescript
{
  id: string;        // Firebase Auth UID
  name: string;      // User's full name
  email: string;     // User's email
  role: 'admin' | 'user';  // User role
}
```

### Tasks Collection
```typescript
{
  id: string;        // Auto-generated document ID
  title: string;     // Task title
  description: string; // Task description
  status: 'pending' | 'in-progress' | 'completed';
  assignedTo: string; // User ID (reference to users collection)
  deadline: Timestamp; // Task deadline
  createdAt: Timestamp; // Creation timestamp
}
```

## Running the Application

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Access the application at `http://localhost:8080`

## Demo Credentials
- **Admin**: admin@taskmanager.com / admin123
- **User**: user@taskmanager.com / user123

## Additional Features

### Email Notifications (Optional)
To implement email notifications when tasks are assigned:

1. Set up Firebase Cloud Functions
2. Create a function triggered on task creation
3. Use email service (SendGrid, etc.) to send notifications

### Cloud Functions Example
```javascript
exports.onTaskCreated = functions.firestore
  .document('tasks/{taskId}')
  .onCreate(async (snapshot, context) => {
    const task = snapshot.data();
    const user = await admin.firestore()
      .collection('users')
      .doc(task.assignedTo)
      .get();
    
    // Send email notification logic here
  });
```

## Project Structure
- `src/services/` - Firebase service classes (AuthService, TaskService)
- `src/components/` - React components (AuthForm, UserDashboard, AdminDashboard, etc.)
- `src/lib/` - Firebase configuration
- `src/index.css` - Design system and custom styles
- `tailwind.config.ts` - Tailwind CSS configuration

## Architecture Notes
- Uses Object-Oriented Programming principles in service layers
- Implements proper error handling and loading states
- Role-based routing with protected routes
- Optimized Firestore queries with proper indexing
- Professional UI with consistent design system
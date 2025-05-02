# 28 Days Challenge

A web application for creating and tracking 28-day challenges. This tool helps users commit to new habits or activities by breaking them down into a manageable 28-day period.

## Features

- **User Authentication**: Register, login, and logout with email/password or Google sign-in
- **Challenge Management**: Create, edit, and manage 28-day challenges
- **Activity Tracking**: Track completion of daily challenge activities
- **Challenge Sharing**: Invite others to join your challenges via invitation links
- **User Profiles**: Customize your profile with a display name and personalized color
- **Dashboard**: View all your active and completed challenges in one place

## Tech Stack

- **Frontend**: React with TypeScript
- **Build Tool**: Vite
- **Backend/Database**: Firebase (Authentication and Firestore)
- **Routing**: React Router DOM
- **Styling**: TailwindCSS
- **Icons**: Lucide React

## Prerequisites

- Node.js (v16 or later)
- npm or yarn
- A Firebase account (for your own deployment)

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd 28-days-challenge
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Firebase Setup (for your own deployment)

This project uses Firebase for authentication and data storage. The repository includes a configuration with demo credentials, but for your own deployment:

1. Create a new project in the [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password and Google providers)
3. Create a Firestore database
4. Get your Firebase configuration from Project Settings
5. Update the configuration in `src/firebase/config.ts`

### 4. Start the development server

```bash
npm run dev
# or
yarn dev
```

The application will be available at [http://localhost:5173](http://localhost:5173)

## Building for Production

```bash
npm run build
# or
yarn build
```

This will create a production-ready build in the `dist` directory.

To preview the production build locally:

```bash
npm run serve
# or
yarn serve
```

## Project Structure

- `src/components/`: React components organized by feature
- `src/context/`: React Context for state management
- `src/firebase/`: Firebase configuration and utility functions
- `src/hooks/`: Custom React hooks
- `src/types/`: TypeScript type definitions
- `src/utils/`: Utility functions
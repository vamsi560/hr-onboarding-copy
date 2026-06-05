# ValueMomentum HR Onboarding System

A professional React-based HR onboarding application for ValueMomentum with enhanced routing and user experience.

## Features

- **User Authentication** - Secure login with session management
- **URL-based Routing** - Clean navigation with React Router
- **Multi-step Onboarding Form** - Comprehensive form with validation and auto-save
- **Document Management** - Upload, preview, and manage documents with drag & drop
- **AI Validation** - View AI-powered document validation results
- **HR Dashboard** - Review candidates, filter, and bulk actions
- **Chat Assistant** - Interactive chat support
- **Dark Mode** - Toggle between light and dark themes
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Project Structure

```
src/
├── components/          # React components
│   ├── Auth/           # Authentication components
│   ├── Dashboard/      # Dashboard components
│   ├── Documents/      # Document management
│   ├── Forms/          # Form components
│   ├── HR/             # HR review components
│   ├── Layout/         # Layout components (Header, Sidebar)
│   ├── UI/             # Reusable UI components
│   └── ...
├── context/            # React Context for state management
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
└── styles/             # Global styles
```

## Key Technologies

- React 18
- React Router
- Context API for state management
- CSS3 with CSS Variables
- LocalStorage for persistence

## Features in Detail

### State Management
- Uses React Context API for global state
- LocalStorage for data persistence
- Session management with timeout

### Components
- Modular, reusable component architecture
- Professional UI components (Button, Card, Input, etc.)
- Responsive design with mobile-first approach

### User Experience
- Toast notifications for user feedback
- Loading states for async operations
- Form validation with error messages
- Auto-save functionality
- Progress tracking

## License

Copyright © ValueMomentum. All rights reserved.


# React Application Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Copy Logo File**
   - Copy `images/ValueMomentum_logo.png` to `public/images/ValueMomentum_logo.png`
   - Or run: `xcopy images\ValueMomentum_logo.png public\images\ /Y` (Windows)

3. **Start Development Server**
   ```bash
   npm start
   ```

4. **Open Browser**
   - Navigate to http://localhost:3000

## Project Structure

```
hr-onboarding/
├── public/
│   ├── images/
│   │   └── ValueMomentum_logo.png  (copy from images folder)
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Auth/           # Login component
│   │   ├── Dashboard/      # Dashboard view
│   │   ├── Documents/      # Document management
│   │   ├── Forms/          # Onboarding form
│   │   ├── HR/             # HR review dashboard
│   │   ├── Layout/         # Header, Sidebar, MainLayout
│   │   ├── UI/             # Reusable components
│   │   ├── Validation/     # AI validation view
│   │   ├── Support/         # Support page
│   │   └── Chat/           # Chat widget
│   ├── context/            # React Context providers
│   ├── utils/              # Utility functions
│   └── styles/             # Global styles
├── package.json
└── README.md
```

## Features Implemented

✅ Professional React component structure
✅ Context API for state management
✅ Reusable UI components (Button, Card, Input, etc.)
✅ Toast notifications system
✅ Loading states
✅ Dark mode support
✅ Responsive design
✅ Form validation
✅ Document management
✅ HR dashboard with filters
✅ Chat widget

## Next Steps

1. Copy the logo file to `public/images/`
2. Run `npm install` to install dependencies
3. Run `npm start` to start the development server
4. The application will open at http://localhost:3000

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.


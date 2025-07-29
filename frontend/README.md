# Hackathon Frontend Project

## Project Overview

This is a Next.js-based frontend application for the hackathon project, featuring authentication, job/course management, AI chat, quiz functionality, and resume building capabilities.

## Project Structure

```
C:\KaamSathi_Hackathon\FRONTEND
│   Configuration files (.env, eslint, tsconfig, etc.)
│
├───app                     # Next.js app directory
│   │   Global styles and layout
│   │
│   ├───(authenticated)     # Authenticated routes
│   │   ├───chat            # AI chat interface
│   │   ├───profile         # User profile
│   │   ├───quiz            # AI quiz interface
│   │   └───resume          # Resume builder with style variants
│   │
│   ├───api                 # API routes
│   ├───courses             # Course listings and details
│   ├───jobs                # Job listings
│   ├───login               # Login page
│   ├───register            # Registration page
│   ├───remotejobs          # Remote job listings
│   └───remotejobsAdminPanel # Admin panel for remote jobs
│
├───components              # Reusable components
│   ├───AtsScanner          # Applicant Tracking System scanner
│   ├───ResumeBuilder       # Resume building components
│   └───ui                  # UI primitives (shadcn/ui)
│
├───hooks                   # Custom React hooks
├───lib                     # Utility libraries
└───public                  # Static assets
```

## Key Features

- **Authentication System**: Login and registration flows
- **AI Integration**:
  - Chat interface
  - Quiz generation
- **Job Management**:
  - Job listings
  - Remote job portal
- **Course Management**: Course listings and details
- **Resume Builder**: Customizable resume generation with multiple styles
- **ATS Scanner**: Applicant Tracking System compatibility checker

## Environment Variables

Create a `.env` file based on the provided `.env.example`:

```
NEXT_PUBLIC_API_URL=http://localhost:5000  # Backend API URL
# Add other required environment variables here
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on the example
4. Configure the backend API URL

## Running the Application

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

## Technical Stack

- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Context (or Zustand/Jotai if used)
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form
- **Authentication**: JWT tokens

## Available Scripts

- `dev`: Starts development server
- `build`: Creates production build
- `start`: Starts production server
- `lint`: Runs ESLint
- `format`: Formats code with Prettier

## Component Architecture

### Core Components

- **ResumeBuilder**: Complete resume generation system with:
  - `BuilderForm`: Input form for resume data
  - `ResumePreview`: Live preview component
  - `PDFResume`: PDF generation functionality

- **AtsScanner**: Applicant Tracking System compatibility checker

- **UI Primitives** (shadcn/ui):
  - Customizable components like buttons, cards, inputs, etc.
  - Accessibility-focused implementations

## Routing Structure

- Public routes:
  - `/login`
  - `/register`
  
- Authenticated routes:
  - `/chat` - AI chat interface
  - `/quiz` - AI quiz interface
  - `/resume/[style]` - Resume builder with style variants
  - `/profile` - User profile
  - `/jobs` - Job listings
  - `/courses` - Course management

## API Integration

The frontend communicates with the backend via:

- `lib/axios.ts`: Configured Axios instance with interceptors
- API routes in `/app/api` for any frontend-specific endpoints

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

[MIT](https://choosealicense.com/licenses/mit/)
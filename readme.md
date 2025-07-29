# KaamSathi

## Project Overview

A comprehensive career development platform featuring AI-powered tools for job seekers, including resume building, interview preparation, skill assessment, and personalized learning recommendations.

## Technical Architecture

### Backend System
- **Framework**: Node.js with Express
- **Database**: PostgreSQL with TypeORM
- **API Documentation**: Swagger/OpenAPI
- **Authentication**: JWT-based
- **AI Services**: 
  - Google Gemini for chat and quiz
  - Tavily API for research capabilities
- **File Processing**: PDF generation and parsing

### Frontend System
- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS
- **Component Library**: shadcn/ui
- **State Management**: React Context
- **Build System**: Vite

## Core Features

### Backend Services
1. **User Management**
   - Authentication (JWT)
   - Profile management
   - Progress tracking

2. **AI Integration**
   - Chatbot for career guidance
   - Quiz generator for skill assessment
   - Resume analysis

3. **Content Management**
   - Job listings
   - Course recommendations
   - Learning paths

4. **Document Processing**
   - Resume generation (PDF)
   - ATS compatibility scoring

### Frontend Modules
1. **Authentication Flow**
   - Login/Registration
   - Protected routes

2. **Career Tools**
   - Resume builder with multiple templates
   - ATS scanner
   - Job matching engine

3. **Learning Resources**
   - Course recommendations
   - Skill assessment quizzes
   - Personalized learning paths

4. **AI Assistant**
   - Career guidance chatbot
   - Interview preparation
   - Resume feedback

## Development Setup

### Prerequisites
- Node.js (v18+)
- PostgreSQL
- API keys for Gemini and Tavily services

### Backend Installation
1. Navigate to `backend` folder
2. Install dependencies: `npm install`
3. Create `.env` file from `.env.example`
4. Run migrations: `npm run typeorm migration:run`
5. Start server: `npm run dev`

### Frontend Installation
1. Navigate to `frontend` folder
2. Install dependencies: `npm install`
3. Create `.env` file from `.env.example`
4. Start development server: `npm run dev`

## Environment Configuration

### Backend (.env)
```
DB_URL=postgres://user:password@localhost:5432/dbname
DB_SYNCHRONIZE=true # disable in production
PORT=5000
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000
GEMINI_API_KEY=your-gemini-key
TAVILY_API_KEY=your-tavily-key
```

### Frontend (.env)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

## API Documentation

Access the Swagger documentation at:
`http://localhost:5000/api-docs`

## Deployment

### Backend
1. Build: `npm run build`
2. Start: `npm start`

### Frontend
1. Build: `npm run build`
2. Start: `npm start`

## Contributing Guidelines

1. Create an issue describing the proposed change
2. Fork the repository
3. Create a feature branch
4. Submit a pull request with:
   - Description of changes
   - Screenshots (for UI changes)
   - Updated tests

## License

MIT License - see [LICENSE](LICENSE) file for details
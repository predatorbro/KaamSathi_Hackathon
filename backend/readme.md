# Hackathon Backend Project

## Project Structure

```
C:\KaamSathi_Hackathon\BACKEND\SRC
│   app.ts                  # Main application entry point
│   data-source.ts          # Database connection configuration
│
├───agents                  # AI agent implementations
│       chatbot.ts          
│
├───config                  # Configuration files
│       swaggerConfig.ts    # Swagger/OpenAPI documentation setup
│
├───constants               # Application constants
│       env.constants.ts    # Environment variable constants
│
├───controllers             # Route controllers
│       ai-chatbot.controller.ts  # AI chatbot endpoints
│       ai-quiz.controller.ts     # AI quiz endpoints
│       auth.controller.ts        # Authentication endpoints
│       course.controller.ts      # Course management
│       job.controller.ts         # Job management
│       resume.controller.ts      # Resume generation
│
├───entities                # TypeORM database entities
│       course.entity.ts    # Course data model
│       job.entity.ts       # Job data model
│       user.entity.ts      # User data model
│       user_courses.entity.ts # User-Course relationship
│       user_jobs.entity.ts    # User-Job relationship
│
├───middleware             # Express middleware
│       auth.middleware.ts  # Authentication middleware
│       error.middleware.ts # Error handling
│       file-upload.middleware.ts # File upload handling
│
├───routes                 # API route definitions
│       ai-chatbot.route.ts 
│       ai-quiz.routes.ts  
│       auth.routes.ts     
│       course.route.ts    
│       job.route.ts       
│       resume.route.ts    
│
├───services              # Business logic services
│       ai-quiz.service.ts 
│       auth.service.ts    
│       chat-memory.service.ts 
│       course.service.ts  
│       job.service.ts     
│       pdf.service.ts     # PDF generation
│       resume.service.ts  
│       tavily-client.service.ts # Tavily API client
│
├───templates             # Template files
│       resume.hbs         # Resume template (Handlebars)
│
└───types                 # Custom type definitions
        api.types.ts      
```

## Environment Variables

The following environment variables are required:

```
DB_URL=                  # Database connection URL
DB_SYNCHRONIZE=true      # Auto-sync database schema (disable in production)
PORT=5000                # Server port
JWT_SECRET=              # Secret for JWT token generation
FRONTEND_URL=http://localhost:3000  # Frontend URL for CORS
GEMINI_API_KEY=          # Google Gemini API key
TAVILY_API_KEY=          # Tavily API key
```

## Features

- **Authentication System**: JWT-based authentication
- **AI Integration**: 
  - Chatbot functionality
  - Quiz generation
  - Resume analysis
- **Database**: TypeORM with PostgreSQL
- **Documentation**: Swagger/OpenAPI support
- **File Processing**: PDF generation and processing
- **Job/Course Management**: Track jobs and courses for users

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on the example above
4. Set up your database and update `DB_URL`
5. Obtain API keys for Gemini and Tavily services

## Running the Application

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

## API Documentation

After starting the server, access the Swagger documentation at:
`http://localhost:5000/api-docs`

## Dependencies

- Express.js - Web framework
- TypeORM - Database ORM
- JSON Web Tokens - Authentication
- Swagger UI - API documentation
- Handlebars - Template engine
- Google Gemini - AI services
- Tavily - Research API

## Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

[MIT](https://choosealicense.com/licenses/mit/)
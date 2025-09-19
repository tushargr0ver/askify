# 🚀 Askify - AI-Powered Document & Code Assistant

<div align="center">

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-askify.tushr.xyz-4285f4?style=for-the-badge)](https://askify.tushr.xyz)
[![GitHub](https://img.shields.io/badge/GitHub-tushargr0ver/askify-181717?style=for-the-badge&logo=github)](https://github.com/tushargr0ver/askify)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript)](https://typescriptlang.org/)

_Transform your documents and codebases into intelligent conversation partners_

</div>

## ✨ Overview

Askify is a modern, full-stack AI chat application that revolutionizes how you interact with documents and code repositories. Upload PDF documents or connect GitHub repositories to chat with your content using state-of-the-art AI models including GPT-4o, GPT-5, o3 Mini/Pro, and Google Gemini.

### 🎯 Key Features

- **📄 Document Intelligence**: Upload and chat with PDF, DOC, and DOCX files
- **🔗 Repository Analysis**: Connect public GitHub repositories for code exploration
- **🤖 Multi-Model AI**: Choose from GPT-4o, GPT-5, o3 series, and Gemini models
- **📊 Usage Analytics**: Track daily/monthly usage with visual breakdowns
- **🎨 Modern UI**: Beautiful dark/light theme with responsive design
- **⚡ Real-time Processing**: Background job processing with live progress updates
- **🔒 Secure Authentication**: JWT-based auth with protected routes
- **🚀 High Performance**: Vector embeddings with Qdrant for fast retrieval

## 🏗️ Architecture

### Frontend (Next.js 15)

- **React 19** with TypeScript for type safety
- **Tailwind CSS** + **shadcn/ui** for modern, accessible components
- **Zustand** for lightweight state management
- **Server-side rendering** with proper hydration handling

### Backend (NestJS)

- **RESTful API** with TypeScript
- **Prisma ORM** with PostgreSQL database
- **Redis/Bull** queues for background processing
- **Passport JWT** authentication strategy
- **File upload** with validation and processing

### AI & Vector Processing

- **OpenAI GPT Models**: GPT-4o, GPT-5, o3 Mini/Pro
- **Google Gemini**: Latest 2.0 Flash models
- **LangChain**: Document processing and retrieval
- **Qdrant**: Vector database for semantic search
- **OpenAI Embeddings**: text-embedding-3-small

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- Docker and Docker Compose
- PostgreSQL, Redis, and Qdrant (via Docker)

### 1. Clone the Repository

```bash
git clone https://github.com/tushargr0ver/askify.git
cd askify
```

### 2. Environment Setup

Create `.env` files in both `client` and `server` directories:

**Server `.env`:**

```env
DATABASE_URL="postgresql://user:password@localhost:5432/askify"
JWT_SECRET="your-super-secret-jwt-key"
OPENAI_API_KEY="your-openai-api-key"
GEMINI_API_KEY="your-gemini-api-key"
```

**Client `.env.local`:**

```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

### 3. Start Infrastructure

```bash
docker-compose up -d
```

### 4. Install Dependencies & Run

```bash
# Install dependencies for both client and server
cd server && pnpm install
cd ../client && pnpm install

# Run database migrations
cd ../server && npx prisma migrate dev

# Start development servers
cd server && pnpm run start:dev  # Backend on :3001
cd client && pnpm run dev        # Frontend on :3000
```

## 📖 Usage Guide

### 🔐 Authentication

1. **Sign up** with email and password
2. **Login** to access your personalized dashboard
3. **Manage preferences** including preferred AI models

### 📄 Document Chat

1. Click **"New Chat"** → **"Upload Document"**
2. Select PDF, DOC, or DOCX files (max 5MB)
3. Wait for processing completion
4. Start asking questions about your document content

### 🔗 Repository Chat

1. Click **"New Chat"** → **"Fetch Repository"**
2. Enter a **public GitHub repository URL**
3. Wait for code analysis and vectorization
4. Explore your codebase through natural language queries

### 🤖 AI Model Selection

- **GPT-4o**: Balanced performance for general tasks
- **GPT-5**: Advanced reasoning capabilities
- **o3 Mini/Pro**: Optimized for coding and STEM
- **Gemini 2.0**: Multimodal with strong reasoning

## 🛡️ Usage Limits

| Plan     | Daily Messages | Monthly Uploads | Monthly Repos |
| -------- | -------------- | --------------- | ------------- |
| **Free** | 50             | 10              | 5             |
| **Pro**  | Unlimited      | Unlimited       | Unlimited     |

## 🔧 API Endpoints

### Authentication

- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user

### Chat Management

- `POST /chat` - Create new chat
- `GET /chat` - List user chats
- `POST /chat/:id/message` - Send message
- `DELETE /chat/:id` - Delete chat

### File Operations

- `POST /file-upload` - Upload document
- `GET /file-upload/job/:id` - Check processing status

### Repository Processing

- `POST /repository/process` - Process GitHub repo
- `GET /repository/job/:id` - Check processing status

## 🏃‍♂️ Development

### Project Structure

```
askify/
├── client/          # Next.js frontend
│   ├── app/         # App router pages
│   ├── components/  # Reusable UI components
│   ├── hooks/       # Custom React hooks
│   └── lib/         # Utilities and API client
├── server/          # NestJS backend
│   ├── src/         # Source code
│   │   ├── auth/    # Authentication module
│   │   ├── chat/    # Chat and AI processing
│   │   ├── file-upload/ # Document processing
│   │   ├── repository/  # GitHub repo handling
│   │   └── users/   # User management
│   └── prisma/      # Database schema and migrations
└── docker-compose.yml # Infrastructure setup
```

### Development Commands

```bash
# Server commands
cd server
pnpm run start:dev    # Development server
pnpm run test         # Run tests
pnpm run build        # Production build

# Client commands
cd client
pnpm run dev          # Development server
pnpm run build        # Production build
pnpm run lint         # ESLint check

# Database operations
npx prisma studio     # Database GUI
npx prisma migrate dev # Run migrations
npx prisma generate   # Generate client
```

## 🚀 Deployment

### Production Environment

```bash
# Build applications
cd server && pnpm run build
cd client && pnpm run build

# Start production servers
cd server && pnpm run start:prod
cd client && pnpm start
```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose -f docker-compose.prod.yml up --build
```

### Environment Variables (Production)

Ensure all environment variables are set for production:

- Database connections
- API keys (OpenAI, Gemini)
- JWT secrets
- CORS origins

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for GPT models and embeddings
- **Google** for Gemini AI models
- **Vercel** for Next.js framework
- **NestJS** for the backend framework
- **LangChain** for AI orchestration
- **Qdrant** for vector search capabilities

---

<div align="center">

**Built with ❤️ by [Tushar Grover](https://github.com/tushargr0ver)**

[🌐 Live Demo](https://askify.tushr.xyz) • [📧 Contact](mailto:tushar@example.com) • [🐦 Twitter](https://twitter.com/tushargr0ver)

</div>

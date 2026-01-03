# Dayflow - HR Management System

## Overview

Dayflow is a professional, minimal HR Management System (HRMS) built as a full-stack TypeScript application. The system provides employee management, attendance tracking, time-off requests, and payroll viewing capabilities with role-based access control (admin vs employee views).

The application follows a monorepo structure with a React frontend, Express backend, and PostgreSQL database using Drizzle ORM for type-safe database operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, bundled via Vite
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state caching and synchronization
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens (Indigo primary, Slate/Zinc neutrals)
- **Forms**: React Hook Form with Zod validation via @hookform/resolvers
- **Charts**: Recharts for dashboard data visualization

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with Zod schemas for request/response validation
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` contains all table definitions shared between frontend and backend

### Project Structure
```
├── client/           # React frontend application
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── pages/        # Route-level page components
│       ├── hooks/        # Custom React hooks for data fetching
│       └── lib/          # Utilities and query client setup
├── server/           # Express backend
│   ├── routes.ts     # API route handlers
│   ├── storage.ts    # Database access layer
│   └── db.ts         # Database connection
├── shared/           # Shared code between frontend/backend
│   ├── schema.ts     # Drizzle table definitions and Zod schemas
│   └── routes.ts     # API route definitions with type contracts
└── migrations/       # Drizzle database migrations
```

### Authentication Pattern
- Session-based authentication with login/signup endpoints
- Role-based access control: "admin" and "employee" roles
- Protected routes redirect unauthenticated users to login
- Admin-only routes (like employee management) check user role

### Data Flow
1. Frontend hooks (e.g., `use-employees.ts`) call API endpoints using fetch with credentials
2. Backend routes in `server/routes.ts` handle requests and call storage methods
3. Storage layer (`server/storage.ts`) performs database operations via Drizzle ORM
4. Responses are validated against Zod schemas defined in `shared/routes.ts`

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries and schema management
- **connect-pg-simple**: Session storage in PostgreSQL

### Frontend Libraries
- **@radix-ui/\***: Headless UI primitives for accessible components
- **TanStack React Query**: Data fetching and caching
- **date-fns**: Date formatting and manipulation
- **recharts**: Dashboard chart visualizations
- **framer-motion**: Page transitions and animations (listed in requirements)

### Build Tools
- **Vite**: Frontend bundler with HMR support
- **esbuild**: Backend bundling for production
- **tsx**: TypeScript execution for development

### Database Commands
- `npm run db:push`: Push schema changes to database using Drizzle Kit
# Everstead Bank - Modern Banking Application

## Overview

This is a full-stack banking application built with modern web technologies, featuring a React frontend with TypeScript, Express.js backend, and PostgreSQL database. The application provides comprehensive banking functionality including account management, transactions, transfers, bill payments, credit card management, and cryptocurrency trading.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Query for server state, React Context for auth
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT tokens with bcrypt for password hashing
- **API**: RESTful endpoints with comprehensive error handling

## Key Components

### Authentication System
- JWT-based authentication with secure token storage
- Password hashing using bcryptjs
- Protected routes with middleware authentication
- User registration, login, and password reset functionality

### Database Design
- **Users**: Core user information with verification status
- **Accounts**: Multiple account types (checking, savings, credit)
- **Transactions**: Comprehensive transaction tracking
- **Transfers**: Internal and external money transfers
- **Cards**: Credit/debit card management
- **Crypto Holdings**: Cryptocurrency portfolio tracking
- **Bill Payments**: Automated bill payment system

### Frontend Features
- Responsive design with mobile-first approach
- Real-time updates using React Query
- Accessible UI components from shadcn/ui
- Toast notifications for user feedback
- Modal dialogs for critical actions

### Security Features
- JWT token-based authentication
- Password hashing with bcrypt
- CORS configuration
- Helmet.js for security headers
- Input validation with Zod schemas

## Data Flow

1. **User Authentication**: Users register/login through the frontend, receiving JWT tokens
2. **API Requests**: Frontend makes authenticated requests to backend endpoints
3. **Database Operations**: Backend processes requests using Drizzle ORM
4. **Real-time Updates**: React Query manages cache invalidation and refetching
5. **State Management**: Auth context provides user state across components

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **@stripe/stripe-js**: Payment processing integration
- **@tanstack/react-query**: Server state management
- **@radix-ui/react-***: Accessible UI primitives
- **drizzle-orm**: Type-safe database queries

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety across the application
- **Tailwind CSS**: Utility-first styling
- **ESLint/Prettier**: Code formatting and linting

### Services
- **Stripe**: Payment processing for premium features
- **CoinGecko API**: Cryptocurrency price data
- **Email Service**: Transaction notifications (configurable)

## Deployment Strategy

### Development Environment
- Vite development server with hot module replacement
- TypeScript compilation with strict mode
- ESLint and Prettier for code quality
- Environment variables for configuration

### Production Build
- Vite builds optimized frontend bundle
- ESBuild compiles backend TypeScript to JavaScript
- Static assets served from Express server
- Database migrations managed through Drizzle Kit

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string
- **JWT_SECRET**: Secret key for JWT token signing
- **STRIPE_SECRET_KEY**: Stripe API key for payments
- **NODE_ENV**: Environment mode (development/production)

### Database Setup
- Drizzle Kit for schema management and migrations
- PostgreSQL as the primary database
- Shared schema types between frontend and backend
- Database seeding for development data

The application follows a monorepo structure with clear separation between client, server, and shared code, making it maintainable and scalable for a modern banking platform.
# Everstead Bank - Modern Banking Application

A full-stack banking application built with React, TypeScript, Express.js, and PostgreSQL.

## Features

- **Account Management**: Checking, savings, and credit accounts
- **Transaction Tracking**: Real-time transaction monitoring
- **Money Transfers**: Internal and external transfers
- **Bill Payments**: Automated bill payment system
- **Credit Cards**: Card management with limits and controls
- **Cryptocurrency**: Bitcoin and Ethereum trading
- **Admin Panel**: Comprehensive administrative controls
- **Real-time Notifications**: Transaction and security alerts

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS with shadcn/ui components
- React Query for state management
- Wouter for routing
- Vite for build tooling

### Backend
- Node.js with Express.js
- PostgreSQL with Drizzle ORM
- JWT authentication
- bcrypt for password hashing
- Stripe integration for payments

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env` and configure the following:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/banking_db
   JWT_SECRET=your-super-secret-jwt-key-here
   SMTP_USER=your-email@example.com
   SMTP_PASS=your-email-password
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
   ```

4. Push database schema:
   ```bash
   npm run db:push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

## Database Schema

The application uses PostgreSQL with the following main tables:
- `users` - User accounts and authentication
- `accounts` - Bank accounts (checking, savings, credit)
- `transactions` - Transaction history
- `transfers` - Money transfers
- `cards` - Credit/debit cards
- `crypto_holdings` - Cryptocurrency holdings
- `notifications` - User notifications
- `admins` - Administrative users

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### User Data
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/accounts` - Get user accounts
- `GET /api/transactions` - Get user transactions
- `GET /api/transfers` - Get user transfers
- `POST /api/transfers` - Create new transfer

### Admin Panel
- `GET /api/admin/dashboard/stats` - Admin dashboard statistics
- `GET /api/admin/users` - Manage users
- `GET /api/admin/accounts` - Manage accounts
- `GET /api/admin/transactions` - Manage transactions

## Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- CORS configuration
- Input validation with Zod schemas
- Protected routes with middleware

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push database schema
- `npm run check` - Type checking

### Admin Access

Default admin credentials:
- Username: `admin`
- Password: `admin123`

## License

MIT License
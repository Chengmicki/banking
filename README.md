# Everstead Bank - Modern Banking Application

A comprehensive full-stack banking application built with React, TypeScript, Express.js, and PostgreSQL.

## Features

### Core Banking Features
- **Account Management**: Multiple account types (checking, savings, credit)
- **Transaction Processing**: Deposits, withdrawals, transfers, and bill payments
- **Card Management**: Credit and debit card services with limits
- **Cryptocurrency Trading**: Buy, sell, and manage crypto holdings
- **Real-time Notifications**: Transaction alerts and security updates

### Security Features
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Role-based Access**: User and admin permission systems
- **Input Validation**: Zod schemas for data validation

### Admin Panel
- **User Management**: View, edit, and manage user accounts
- **Account Oversight**: Balance controls and transaction monitoring
- **Card Administration**: Manage card limits and status
- **System Analytics**: Real-time dashboard with statistics

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** + shadcn/ui for styling
- **React Query** for server state management
- **Wouter** for routing

### Backend  
- **Express.js** with TypeScript
- **PostgreSQL** with Drizzle ORM
- **bcrypt** for password hashing
- **JWT** for authentication
- **Stripe** for payment processing

## Quick Start

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
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and secrets
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

## Default Credentials

### Sample User
- **Email**: john.doe@example.com
- **Password**: password123

### Admin Access
- **Username**: admin
- **Password**: admin123

## Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/bankingapp

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Optional Services
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
SMTP_HOST=smtp.example.com
SMTP_USER=your-email@example.com
SMTP_PASS=your-email-password
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset

### User Routes
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/accounts` - Get user accounts
- `GET /api/transactions` - Get transactions
- `POST /api/transfers` - Create transfer
- `GET /api/cards` - Get user cards
- `GET /api/crypto/holdings` - Get crypto holdings

### Admin Routes
- `GET /api/admin/users` - Get all users
- `GET /api/admin/accounts` - Get all accounts
- `GET /api/admin/transactions` - Get all transactions
- `POST /api/admin/notifications/broadcast` - Send notifications
- `GET /api/admin/dashboard/stats` - Get dashboard statistics

## Database Schema

The application uses PostgreSQL with the following main tables:
- `users` - User accounts and profiles
- `accounts` - Banking accounts (checking, savings, credit)
- `transactions` - All financial transactions
- `cards` - Credit and debit cards
- `crypto_holdings` - Cryptocurrency portfolios
- `admins` - Administrative users

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm run start` - Start production server
- `npm run db:push` - Push database schema changes
- `npx eslint . --ext .ts,.tsx,.js --fix` - Run ESLint with auto-fix
- `npx prettier --write .` - Format code with Prettier

### Project Structure
```
├── client/           # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── lib/
├── server/           # Express backend
│   ├── middleware/
│   ├── services/
│   └── routes.ts
├── shared/           # Shared types and schemas
└── package.json
```

## Security Best Practices

- All passwords are hashed using bcrypt
- JWT tokens for secure authentication
- Input validation with Zod schemas
- CORS configuration for API security
- Environment variable protection for secrets
- Role-based access control for admin features

## License

MIT License - See LICENSE file for details
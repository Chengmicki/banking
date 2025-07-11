# Everstead Bank - Modern Banking Application

A full-stack banking application built with modern web technologies, featuring a React frontend with TypeScript, Express.js backend, and PostgreSQL database.

## Features

### User Features
- **Account Management**: Multiple account types (checking, savings, credit)
- **Transactions**: Comprehensive transaction tracking and history
- **Transfers**: Internal and external money transfers
- **Bill Payments**: Automated bill payment system
- **Credit Card Management**: Card limits, activation, and monitoring
- **Cryptocurrency Trading**: Buy/sell crypto with portfolio tracking
- **Real-time Notifications**: Transaction alerts and system updates

### Admin Features
- **Dashboard**: Comprehensive overview with statistics
- **User Management**: View and manage all users
- **Account Management**: Monitor all accounts and balances
- **Transaction Monitoring**: Track all transactions system-wide
- **Card Management**: Manage all credit/debit cards
- **Crypto Management**: Monitor cryptocurrency holdings
- **Notification System**: Broadcast notifications to all users

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** with shadcn/ui components
- **React Query** for server state management
- **Wouter** for client-side routing
- **Vite** for fast development and optimized builds

### Backend
- **Node.js** with Express.js
- **TypeScript** with ES modules
- **PostgreSQL** with Drizzle ORM
- **JWT** authentication with bcrypt
- **RESTful** API design

### Database
- **PostgreSQL** with comprehensive schema
- **Drizzle ORM** for type-safe queries
- **Database migrations** with Drizzle Kit

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/everstead-bank.git
cd everstead-bank
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database and API keys
```

4. Run database migrations:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Environment Variables

```env
DATABASE_URL=postgresql://username:password@localhost:5432/everstead_bank
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=your-stripe-secret-key
NODE_ENV=development
```

## API Endpoints

### User Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/accounts` - Get user accounts
- `GET /api/transactions` - Get user transactions
- `POST /api/transfers` - Create transfer
- `GET /api/cards` - Get user cards
- `GET /api/crypto/holdings` - Get crypto holdings

### Admin Management
- `POST /api/admin/auth/login` - Admin login
- `GET /api/admin/users` - Get all users
- `GET /api/admin/accounts` - Get all accounts
- `GET /api/admin/transactions` - Get all transactions
- `GET /api/admin/cards` - Get all cards
- `GET /api/admin/crypto` - Get all crypto holdings
- `POST /api/admin/notifications/broadcast` - Broadcast notifications

## Admin Access

Default admin credentials:
- Username: `admin`
- Password: `admin123`

Access the admin panel at `/admin/login`

## Database Schema

The application uses a comprehensive PostgreSQL schema with the following main tables:
- `users` - User accounts and profiles
- `accounts` - Bank accounts (checking, savings, credit)
- `transactions` - Transaction history
- `transfers` - Money transfers
- `cards` - Credit/debit cards
- `crypto_holdings` - Cryptocurrency portfolio
- `notifications` - User notifications
- `admins` - Admin users with permissions

## Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- CORS configuration
- Input validation with Zod schemas
- Protected routes with middleware
- Role-based admin permissions

## Development

### Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open database studio

### Project Structure
```
├── client/          # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom hooks
│   │   └── lib/         # Utilities
├── server/          # Express backend
│   ├── middleware/  # Auth middleware
│   ├── services/    # Business logic
│   └── routes.ts    # API routes
├── shared/          # Shared types and schemas
└── database/        # Database migrations
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please contact [support@everstead.com](mailto:support@everstead.com) or create an issue in the repository.
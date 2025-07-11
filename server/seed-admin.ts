import bcrypt from 'bcryptjs';
import { db } from './db';
import * as schema from '@shared/schema';
import { eq } from 'drizzle-orm';

export async function seedAdmin() {
  try {
    console.log('Seeding admin data...');

    // Check if admin already exists
    const existingAdmin = await db
      .select()
      .from(schema.admins)
      .where(eq(schema.admins.username, 'admin'))
      .limit(1);

    if (existingAdmin.length > 0) {
      console.log('Admin already exists, skipping seed');
      return;
    }

    // Create default admin
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = await db
      .insert(schema.admins)
      .values({
        username: 'admin',
        email: 'admin@everstead.com',
        password: hashedPassword,
        role: 'super_admin',
        permissions: ['all'],
        isActive: true,
      })
      .returning();

    console.log('Admin created successfully:', admin[0]);

    // Seed some sample data for testing
    await seedSampleData();

    console.log('Admin seeding completed');
  } catch (error) {
    console.error('Error seeding admin:', error);
  }
}

async function seedSampleData() {
  try {
    // Create a sample user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await db
      .insert(schema.users)
      .values({
        email: 'john.doe@example.com',
        password: hashedPassword,
        fullName: 'John Doe',
        phone: '+1234567890',
        address: '123 Main St',
        isVerified: true,
      })
      .returning();

    console.log('Sample user created:', user[0]);

    // Create sample accounts for the user
    const checkingAccount = await db
      .insert(schema.accounts)
      .values({
        userId: user[0].id,
        accountType: 'checking',
        accountNumber: 'CHK-001-' + Math.random().toString(36).substr(2, 9),
        balance: '5000.00',
        isActive: true,
      })
      .returning();

    const savingsAccount = await db
      .insert(schema.accounts)
      .values({
        userId: user[0].id,
        accountType: 'savings',
        accountNumber: 'SAV-001-' + Math.random().toString(36).substr(2, 9),
        balance: '15000.00',
        isActive: true,
      })
      .returning();

    console.log('Sample accounts created:', {
      checkingAccount: checkingAccount[0],
      savingsAccount: savingsAccount[0],
    });

    // Create sample transactions
    const transactions = await db
      .insert(schema.transactions)
      .values([
        {
          accountId: checkingAccount[0].id,
          type: 'deposit',
          amount: '2500.00',
          description: 'Salary deposit',
          status: 'completed',
          category: 'income',
          merchantName: 'ABC Corp',
        },
        {
          accountId: checkingAccount[0].id,
          type: 'withdrawal',
          amount: '150.00',
          description: 'ATM withdrawal',
          status: 'completed',
          category: 'cash',
        },
        {
          accountId: savingsAccount[0].id,
          type: 'deposit',
          amount: '10000.00',
          description: 'Initial deposit',
          status: 'completed',
          category: 'transfer',
        },
      ])
      .returning();

    console.log('Sample transactions created:', transactions);

    // Create sample card
    const card = await db
      .insert(schema.cards)
      .values({
        userId: user[0].id,
        accountId: checkingAccount[0].id,
        cardNumber: '4532' + Math.random().toString().slice(2, 14),
        cardType: 'debit',
        expiryDate: '12/28',
        cvv: '123',
        isActive: true,
        dailyLimit: '1000.00',
        monthlyLimit: '5000.00',
      })
      .returning();

    console.log('Sample card created:', card[0]);

    // Create sample crypto holdings
    const cryptoHoldings = await db
      .insert(schema.cryptoHoldings)
      .values([
        {
          userId: user[0].id,
          symbol: 'BTC',
          name: 'Bitcoin',
          amount: '0.5',
          averageCost: '45000.00',
        },
        {
          userId: user[0].id,
          symbol: 'ETH',
          name: 'Ethereum',
          amount: '2.5',
          averageCost: '3000.00',
        },
      ])
      .returning();

    console.log('Sample crypto holdings created:', cryptoHoldings);

    // Create sample notifications
    const notifications = await db
      .insert(schema.notifications)
      .values([
        {
          userId: user[0].id,
          title: 'Welcome to Everstead Bank',
          message: 'Your account has been successfully created and verified.',
          type: 'transaction',
          isRead: false,
        },
        {
          userId: user[0].id,
          title: 'Transaction Alert',
          message: 'Your salary deposit of $2,500 has been processed.',
          type: 'transaction',
          isRead: true,
        },
        {
          userId: user[0].id,
          title: 'Security Notice',
          message: 'Your login credentials were updated successfully.',
          type: 'security',
          isRead: false,
        },
      ])
      .returning();

    console.log('Sample notifications created:', notifications);

    console.log('Sample data seeding completed');
  } catch (error) {
    console.error('Error seeding sample data:', error);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedAdmin()
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

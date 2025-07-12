import { eq, desc, sql, and, inArray } from 'drizzle-orm';
import { db } from './db';
import * as schema from '@shared/schema';
import type { IStorage } from './storage';
import type {
  User,
  InsertUser,
  Account,
  InsertAccount,
  Transaction,
  InsertTransaction,
  Transfer,
  InsertTransfer,
  Payee,
  InsertPayee,
  BillPayment,
  InsertBillPayment,
  Card,
  InsertCard,
  CryptoHolding,
  InsertCryptoHolding,
  Notification,
  InsertNotification,
  Admin,
  InsertAdmin,
} from '@shared/schema';
import bcrypt from 'bcryptjs';

export class PostgresStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | null> {
    const result = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, parseInt(id)))
      .limit(1);
    if (result.length === 0) return null;
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const result = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);
    if (result.length === 0) return null;
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Hash password before storing
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);

    const result = await db
      .insert(schema.users)
      .values({
        ...insertUser,
        password: hashedPassword,
      })
      .returning();

    return result[0];
  }

  async updateUser(id: string, updateData: Partial<User>): Promise<User | null> {
    // Hash password if being updated
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const result = await db
      .update(schema.users)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(schema.users.id, parseInt(id)))
      .returning();

    if (result.length === 0) return null;
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    const result = await db.select().from(schema.users);
    return result;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(schema.users).where(eq(schema.users.id, parseInt(id)));
    return result.rowCount! > 0;
  }

  // Account operations
  async getAccountsByUserId(userId: string): Promise<Account[]> {
    const result = await db
      .select()
      .from(schema.accounts)
      .where(eq(schema.accounts.userId, parseInt(userId)));
    return result;
  }

  async getAccount(id: string): Promise<Account | null> {
    const result = await db
      .select()
      .from(schema.accounts)
      .where(eq(schema.accounts.id, parseInt(id)))
      .limit(1);
    if (result.length === 0) return null;
    return result[0];
  }

  async createAccount(insertAccount: InsertAccount): Promise<Account> {
    const result = await db.insert(schema.accounts).values(insertAccount).returning();
    return result[0];
  }

  async updateAccount(id: string, updateData: Partial<Account>): Promise<Account | null> {
    const result = await db
      .update(schema.accounts)
      .set(updateData)
      .where(eq(schema.accounts.id, parseInt(id)))
      .returning();

    if (result.length === 0) return null;
    return result[0];
  }

  async getAllAccounts(): Promise<Account[]> {
    const result = await db.select().from(schema.accounts);
    return result;
  }

  async deleteAccount(id: string): Promise<boolean> {
    const result = await db.delete(schema.accounts).where(eq(schema.accounts.id, parseInt(id)));
    return result.rowCount! > 0;
  }

  // Transaction operations
  async getTransactionsByAccountId(accountId: string, limit: number = 50): Promise<Transaction[]> {
    const result = await db
      .select()
      .from(schema.transactions)
      .where(eq(schema.transactions.accountId, parseInt(accountId)))
      .orderBy(desc(schema.transactions.createdAt))
      .limit(limit);

    return result;
  }

  async getTransactionsByUserId(userId: string, limit: number = 50): Promise<Transaction[]> {
    const userAccounts = await this.getAccountsByUserId(userId);
    const accountIds = userAccounts.map(account => account.id);

    if (accountIds.length === 0) return [];

    const result = await db
      .select()
      .from(schema.transactions)
      .where(inArray(schema.transactions.accountId, accountIds))
      .orderBy(desc(schema.transactions.createdAt))
      .limit(limit);

    return result;
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const result = await db.insert(schema.transactions).values(insertTransaction).returning();
    return result[0];
  }

  async getAllTransactions(): Promise<Transaction[]> {
    const result = await db.select().from(schema.transactions);
    return result;
  }

  async deleteTransaction(id: string): Promise<boolean> {
    const result = await db
      .delete(schema.transactions)
      .where(eq(schema.transactions.id, parseInt(id)));
    return result.rowCount! > 0;
  }

  // Transfer operations
  async getTransfersByUserId(userId: string, limit: number = 50): Promise<Transfer[]> {
    const userAccounts = await this.getAccountsByUserId(userId);
    const accountIds = userAccounts.map(account => account.id);

    if (accountIds.length === 0) return [];

    const result = await db
      .select()
      .from(schema.transfers)
      .where(inArray(schema.transfers.fromAccountId, accountIds))
      .orderBy(desc(schema.transfers.createdAt))
      .limit(limit);

    return result;
  }

  async createTransfer(insertTransfer: InsertTransfer): Promise<Transfer> {
    const result = await db.insert(schema.transfers).values(insertTransfer).returning();
    return result[0];
  }

  async updateTransfer(id: string, updateData: Partial<Transfer>): Promise<Transfer | null> {
    const result = await db
      .update(schema.transfers)
      .set(updateData)
      .where(eq(schema.transfers.id, parseInt(id)))
      .returning();

    if (result.length === 0) return null;
    return result[0];
  }

  async getAllTransfers(): Promise<Transfer[]> {
    const result = await db.select().from(schema.transfers);
    return result;
  }

  async deleteTransfer(id: string): Promise<boolean> {
    const result = await db.delete(schema.transfers).where(eq(schema.transfers.id, parseInt(id)));
    return result.rowCount! > 0;
  }

  // Payee operations
  async getPayee(id: string): Promise<Payee | null> {
    const result = await db
      .select()
      .from(schema.payees)
      .where(eq(schema.payees.id, parseInt(id)))
      .limit(1);
    if (result.length === 0) return null;
    return result[0];
  }

  async getPayeesByUserId(userId: string): Promise<Payee[]> {
    const result = await db
      .select()
      .from(schema.payees)
      .where(eq(schema.payees.userId, parseInt(userId)));
    return result;
  }

  async createPayee(insertPayee: InsertPayee): Promise<Payee> {
    const result = await db.insert(schema.payees).values(insertPayee).returning();
    return result[0];
  }

  async getAllPayees(): Promise<Payee[]> {
    const result = await db.select().from(schema.payees);
    return result;
  }

  async deletePayee(id: string): Promise<boolean> {
    const result = await db.delete(schema.payees).where(eq(schema.payees.id, parseInt(id)));
    return result.rowCount! > 0;
  }

  // Bill payment operations
  async getBillPaymentsByUserId(userId: string): Promise<BillPayment[]> {
    const result = await db
      .select()
      .from(schema.billPayments)
      .where(eq(schema.billPayments.userId, parseInt(userId)));
    return result;
  }

  async createBillPayment(insertBillPayment: InsertBillPayment): Promise<BillPayment> {
    const result = await db.insert(schema.billPayments).values(insertBillPayment).returning();
    return result[0];
  }

  async getAllBillPayments(): Promise<BillPayment[]> {
    const result = await db.select().from(schema.billPayments);
    return result;
  }

  async deleteBillPayment(id: string): Promise<boolean> {
    const result = await db
      .delete(schema.billPayments)
      .where(eq(schema.billPayments.id, parseInt(id)));
    return result.rowCount! > 0;
  }

  // Card operations
  async getCardsByUserId(userId: string): Promise<Card[]> {
    const result = await db
      .select()
      .from(schema.cards)
      .where(eq(schema.cards.userId, parseInt(userId)));
    return result;
  }

  async createCard(insertCard: InsertCard): Promise<Card> {
    const result = await db.insert(schema.cards).values(insertCard).returning();
    return result[0];
  }

  async updateCard(id: string, updateData: Partial<Card>): Promise<Card | null> {
    const result = await db
      .update(schema.cards)
      .set(updateData)
      .where(eq(schema.cards.id, parseInt(id)))
      .returning();

    if (result.length === 0) return null;
    return result[0];
  }

  async getAllCards(): Promise<Card[]> {
    const result = await db.select().from(schema.cards);
    return result;
  }

  async deleteCard(id: string): Promise<boolean> {
    const result = await db.delete(schema.cards).where(eq(schema.cards.id, parseInt(id)));
    return result.rowCount! > 0;
  }

  // Crypto operations
  async getCryptoHoldingsByUserId(userId: string): Promise<CryptoHolding[]> {
    const result = await db
      .select()
      .from(schema.cryptoHoldings)
      .where(eq(schema.cryptoHoldings.userId, parseInt(userId)));
    return result;
  }

  async getCryptoHolding(userId: string, symbol: string): Promise<CryptoHolding | null> {
    const result = await db
      .select()
      .from(schema.cryptoHoldings)
      .where(
        and(
          eq(schema.cryptoHoldings.userId, parseInt(userId)),
          eq(schema.cryptoHoldings.symbol, symbol)
        )
      )
      .limit(1);

    if (result.length === 0) return null;
    return result[0];
  }

  async createCryptoHolding(insertCryptoHolding: InsertCryptoHolding): Promise<CryptoHolding> {
    const result = await db.insert(schema.cryptoHoldings).values(insertCryptoHolding).returning();
    return result[0];
  }

  async updateCryptoHolding(
    id: string,
    updateData: Partial<CryptoHolding>
  ): Promise<CryptoHolding | null> {
    const result = await db
      .update(schema.cryptoHoldings)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(schema.cryptoHoldings.id, parseInt(id)))
      .returning();

    if (result.length === 0) return null;
    return result[0];
  }

  async getAllCryptoHoldings(): Promise<CryptoHolding[]> {
    const result = await db.select().from(schema.cryptoHoldings);
    return result;
  }

  async deleteCryptoHolding(id: string): Promise<boolean> {
    const result = await db
      .delete(schema.cryptoHoldings)
      .where(eq(schema.cryptoHoldings.id, parseInt(id)));
    return result.rowCount! > 0;
  }

  // Notification operations
  async getNotificationsByUserId(userId: string): Promise<Notification[]> {
    const result = await db
      .select()
      .from(schema.notifications)
      .where(eq(schema.notifications.userId, parseInt(userId)))
      .orderBy(desc(schema.notifications.createdAt));

    return result;
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const result = await db.insert(schema.notifications).values(insertNotification).returning();
    return result[0];
  }

  async updateNotification(
    id: string,
    updateData: Partial<Notification>
  ): Promise<Notification | null> {
    const result = await db
      .update(schema.notifications)
      .set(updateData)
      .where(eq(schema.notifications.id, parseInt(id)))
      .returning();

    if (result.length === 0) return null;
    return result[0];
  }

  async getAllNotifications(): Promise<Notification[]> {
    const result = await db.select().from(schema.notifications);
    return result;
  }

  async deleteNotification(id: string): Promise<boolean> {
    const result = await db
      .delete(schema.notifications)
      .where(eq(schema.notifications.id, parseInt(id)));
    return result.rowCount! > 0;
  }

  // Admin operations
  async getAdmin(id: string): Promise<Admin | null> {
    const result = await db
      .select()
      .from(schema.admins)
      .where(eq(schema.admins.id, parseInt(id)))
      .limit(1);
    if (result.length === 0) return null;
    return result[0];
  }

  async getAdminByEmail(email: string): Promise<Admin | null> {
    const result = await db
      .select()
      .from(schema.admins)
      .where(eq(schema.admins.email, email))
      .limit(1);
    if (result.length === 0) return null;
    return result[0];
  }

  async getAdminByUsername(username: string): Promise<Admin | null> {
    const result = await db
      .select()
      .from(schema.admins)
      .where(eq(schema.admins.username, username))
      .limit(1);
    if (result.length === 0) return null;
    return result[0];
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    // Hash password before storing
    const hashedPassword = await bcrypt.hash(insertAdmin.password, 10);

    const result = await db
      .insert(schema.admins)
      .values({
        ...insertAdmin,
        password: hashedPassword,
      })
      .returning();

    return result[0];
  }

  async updateAdmin(id: string, updateData: Partial<Admin>): Promise<Admin | null> {
    // Hash password if being updated
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const result = await db
      .update(schema.admins)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(schema.admins.id, parseInt(id)))
      .returning();

    if (result.length === 0) return null;
    return result[0];
  }

  async getAllAdmins(): Promise<Admin[]> {
    const result = await db.select().from(schema.admins);
    return result;
  }

  async deleteAdmin(id: string): Promise<boolean> {
    const result = await db.delete(schema.admins).where(eq(schema.admins.id, parseInt(id)));
    return result.rowCount! > 0;
  }
}

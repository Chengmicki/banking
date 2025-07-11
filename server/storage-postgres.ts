import { eq, desc, sql, and, inArray } from "drizzle-orm";
import { db } from "./db";
import * as schema from "@shared/schema";
import type { IStorage } from "./storage";
import type {
  User, InsertUser, Account, InsertAccount, Transaction, InsertTransaction,
  Transfer, InsertTransfer, Payee, InsertPayee, BillPayment, InsertBillPayment,
  Card, InsertCard, CryptoHolding, InsertCryptoHolding, Notification, InsertNotification,
  Admin, InsertAdmin
} from "@shared/schema";
import bcrypt from "bcryptjs";

// Helper types for MongoDB compatibility (adapting from string to number IDs)
type MongoUser = Omit<User, 'id'> & { _id: string };
type MongoAccount = Omit<Account, 'id' | 'userId'> & { _id: string; userId: string };
type MongoTransaction = Omit<Transaction, 'id' | 'accountId'> & { _id: string; accountId: string };
type MongoTransfer = Omit<Transfer, 'id' | 'fromAccountId' | 'toAccountId'> & { _id: string; fromAccountId: string; toAccountId?: string };
type MongoPayee = Omit<Payee, 'id' | 'userId'> & { _id: string; userId: string };
type MongoBillPayment = Omit<BillPayment, 'id' | 'userId' | 'payeeId' | 'accountId'> & { _id: string; userId: string; payeeId: string; accountId: string };
type MongoCard = Omit<Card, 'id' | 'userId' | 'accountId'> & { _id: string; userId: string; accountId: string };
type MongoCryptoHolding = Omit<CryptoHolding, 'id' | 'userId'> & { _id: string; userId: string };
type MongoNotification = Omit<Notification, 'id' | 'userId'> & { _id: string; userId: string };
type MongoAdmin = Omit<Admin, 'id'> & { _id: string };

export class PostgresStorage implements IStorage {
  
  // Helper function to convert PostgreSQL result to MongoDB-style result
  private pgToMongo<T extends { id: number }, M extends { _id: string }>(
    pgResult: T, 
    userIdField?: keyof T, 
    accountIdField?: keyof T,
    otherIdFields?: (keyof T)[]
  ): M {
    const { id, ...rest } = pgResult;
    const result: any = {
      _id: id.toString(),
      ...rest,
    };
    
    // Convert numeric foreign keys to strings for MongoDB compatibility
    if (userIdField && pgResult[userIdField]) {
      result.userId = pgResult[userIdField]!.toString();
    }
    if (accountIdField && pgResult[accountIdField]) {
      result.accountId = pgResult[accountIdField]!.toString();
    }
    if (otherIdFields) {
      otherIdFields.forEach(field => {
        if (pgResult[field]) {
          const fieldName = field.toString().replace('Id', 'Id');
          result[fieldName] = pgResult[field]!.toString();
        }
      });
    }
    
    return result as M;
  }

  // User operations
  async getUser(id: string): Promise<MongoUser | null> {
    const result = await db.select().from(schema.users).where(eq(schema.users.id, parseInt(id))).limit(1);
    if (result.length === 0) return null;
    return this.pgToMongo<User, MongoUser>(result[0]);
  }

  async getUserByEmail(email: string): Promise<MongoUser | null> {
    const result = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
    if (result.length === 0) return null;
    return this.pgToMongo<User, MongoUser>(result[0]);
  }

  async createUser(insertUser: Omit<InsertUser, 'password'> & { password: string }): Promise<MongoUser> {
    // Hash password before storing
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    
    const result = await db.insert(schema.users).values({
      ...insertUser,
      password: hashedPassword,
    }).returning();
    
    return this.pgToMongo<User, MongoUser>(result[0]);
  }

  async updateUser(id: string, updateData: Partial<MongoUser>): Promise<MongoUser | null> {
    const { _id, ...pgUpdateData } = updateData;
    
    // Hash password if being updated
    if (pgUpdateData.password) {
      pgUpdateData.password = await bcrypt.hash(pgUpdateData.password, 10);
    }
    
    const result = await db.update(schema.users)
      .set({ ...pgUpdateData, updatedAt: new Date() })
      .where(eq(schema.users.id, parseInt(id)))
      .returning();
    
    if (result.length === 0) return null;
    return this.pgToMongo<User, MongoUser>(result[0]);
  }

  async getAllUsers(): Promise<MongoUser[]> {
    const result = await db.select().from(schema.users);
    return result.map(user => this.pgToMongo<User, MongoUser>(user));
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(schema.users).where(eq(schema.users.id, parseInt(id)));
    return result.rowCount! > 0;
  }

  // Account operations
  async getAccountsByUserId(userId: string): Promise<MongoAccount[]> {
    const result = await db.select().from(schema.accounts).where(eq(schema.accounts.userId, parseInt(userId)));
    return result.map(account => this.pgToMongo<Account, MongoAccount>(account, 'userId'));
  }

  async getAccount(id: string): Promise<MongoAccount | null> {
    const result = await db.select().from(schema.accounts).where(eq(schema.accounts.id, parseInt(id))).limit(1);
    if (result.length === 0) return null;
    return this.pgToMongo<Account, MongoAccount>(result[0], 'userId');
  }

  async createAccount(insertAccount: Omit<InsertAccount, 'userId'> & { userId: string }): Promise<MongoAccount> {
    const result = await db.insert(schema.accounts).values({
      ...insertAccount,
      userId: parseInt(insertAccount.userId),
    }).returning();
    
    return this.pgToMongo<Account, MongoAccount>(result[0], 'userId');
  }

  async updateAccount(id: string, updateData: Partial<MongoAccount>): Promise<MongoAccount | null> {
    const { _id, userId, ...pgUpdateData } = updateData;
    const updateValues: any = { ...pgUpdateData };
    
    if (userId) {
      updateValues.userId = parseInt(userId);
    }
    
    const result = await db.update(schema.accounts)
      .set(updateValues)
      .where(eq(schema.accounts.id, parseInt(id)))
      .returning();
    
    if (result.length === 0) return null;
    return this.pgToMongo<Account, MongoAccount>(result[0], 'userId');
  }

  async getAllAccounts(): Promise<MongoAccount[]> {
    const result = await db.select().from(schema.accounts);
    return result.map(account => this.pgToMongo<Account, MongoAccount>(account, 'userId'));
  }

  async deleteAccount(id: string): Promise<boolean> {
    const result = await db.delete(schema.accounts).where(eq(schema.accounts.id, parseInt(id)));
    return result.rowCount! > 0;
  }

  // Transaction operations
  async getTransactionsByAccountId(accountId: string, limit: number = 50): Promise<MongoTransaction[]> {
    const result = await db.select().from(schema.transactions)
      .where(eq(schema.transactions.accountId, parseInt(accountId)))
      .orderBy(desc(schema.transactions.createdAt))
      .limit(limit);
    
    return result.map(transaction => this.pgToMongo<Transaction, MongoTransaction>(transaction, undefined, 'accountId'));
  }

  async getTransactionsByUserId(userId: string, limit: number = 50): Promise<MongoTransaction[]> {
    const userAccounts = await this.getAccountsByUserId(userId);
    const accountIds = userAccounts.map(account => parseInt(account._id));
    
    if (accountIds.length === 0) return [];
    
    const result = await db.select().from(schema.transactions)
      .where(inArray(schema.transactions.accountId, accountIds))
      .orderBy(desc(schema.transactions.createdAt))
      .limit(limit);
    
    return result.map(transaction => this.pgToMongo<Transaction, MongoTransaction>(transaction, undefined, 'accountId'));
  }

  async createTransaction(insertTransaction: Omit<InsertTransaction, 'accountId'> & { accountId: string }): Promise<MongoTransaction> {
    const result = await db.insert(schema.transactions).values({
      ...insertTransaction,
      accountId: parseInt(insertTransaction.accountId),
    }).returning();
    
    return this.pgToMongo<Transaction, MongoTransaction>(result[0], undefined, 'accountId');
  }

  async getAllTransactions(): Promise<MongoTransaction[]> {
    const result = await db.select().from(schema.transactions);
    return result.map(transaction => this.pgToMongo<Transaction, MongoTransaction>(transaction, undefined, 'accountId'));
  }

  async deleteTransaction(id: string): Promise<boolean> {
    const result = await db.delete(schema.transactions).where(eq(schema.transactions.id, parseInt(id)));
    return result.rowCount! > 0;
  }

  // Transfer operations
  async getTransfersByUserId(userId: string, limit: number = 50): Promise<MongoTransfer[]> {
    const userAccounts = await this.getAccountsByUserId(userId);
    const accountIds = userAccounts.map(account => parseInt(account._id));
    
    if (accountIds.length === 0) return [];
    
    const result = await db.select().from(schema.transfers)
      .where(inArray(schema.transfers.fromAccountId, accountIds))
      .orderBy(desc(schema.transfers.createdAt))
      .limit(limit);
    
    return result.map(transfer => {
      const { id, fromAccountId, toAccountId, ...rest } = transfer;
      return {
        _id: id.toString(),
        fromAccountId: fromAccountId.toString(),
        toAccountId: toAccountId?.toString(),
        ...rest,
      } as MongoTransfer;
    });
  }

  async createTransfer(insertTransfer: Omit<InsertTransfer, 'fromAccountId' | 'toAccountId'> & { fromAccountId: string; toAccountId?: string }): Promise<MongoTransfer> {
    const result = await db.insert(schema.transfers).values({
      ...insertTransfer,
      fromAccountId: parseInt(insertTransfer.fromAccountId),
      toAccountId: insertTransfer.toAccountId ? parseInt(insertTransfer.toAccountId) : null,
    }).returning();
    
    const { id, fromAccountId, toAccountId, ...rest } = result[0];
    return {
      _id: id.toString(),
      fromAccountId: fromAccountId.toString(),
      toAccountId: toAccountId?.toString(),
      ...rest,
    } as MongoTransfer;
  }

  async updateTransfer(id: string, updateData: Partial<MongoTransfer>): Promise<MongoTransfer | null> {
    const { _id, fromAccountId, toAccountId, ...pgUpdateData } = updateData;
    const updateValues: any = { ...pgUpdateData };
    
    if (fromAccountId) updateValues.fromAccountId = parseInt(fromAccountId);
    if (toAccountId) updateValues.toAccountId = parseInt(toAccountId);
    
    const result = await db.update(schema.transfers)
      .set(updateValues)
      .where(eq(schema.transfers.id, parseInt(id)))
      .returning();
    
    if (result.length === 0) return null;
    
    const { id: resultId, fromAccountId: resultFromAccountId, toAccountId: resultToAccountId, ...rest } = result[0];
    return {
      _id: resultId.toString(),
      fromAccountId: resultFromAccountId.toString(),
      toAccountId: resultToAccountId?.toString(),
      ...rest,
    } as MongoTransfer;
  }

  async getAllTransfers(): Promise<MongoTransfer[]> {
    const result = await db.select().from(schema.transfers);
    return result.map(transfer => {
      const { id, fromAccountId, toAccountId, ...rest } = transfer;
      return {
        _id: id.toString(),
        fromAccountId: fromAccountId.toString(),
        toAccountId: toAccountId?.toString(),
        ...rest,
      } as MongoTransfer;
    });
  }

  async deleteTransfer(id: string): Promise<boolean> {
    const result = await db.delete(schema.transfers).where(eq(schema.transfers.id, parseInt(id)));
    return result.rowCount! > 0;
  }

  // Payee operations
  async getPayeesByUserId(userId: string): Promise<MongoPayee[]> {
    const result = await db.select().from(schema.payees).where(eq(schema.payees.userId, parseInt(userId)));
    return result.map(payee => this.pgToMongo<Payee, MongoPayee>(payee, 'userId'));
  }

  async createPayee(insertPayee: Omit<InsertPayee, 'userId'> & { userId: string }): Promise<MongoPayee> {
    const result = await db.insert(schema.payees).values({
      ...insertPayee,
      userId: parseInt(insertPayee.userId),
    }).returning();
    
    return this.pgToMongo<Payee, MongoPayee>(result[0], 'userId');
  }

  async getAllPayees(): Promise<MongoPayee[]> {
    const result = await db.select().from(schema.payees);
    return result.map(payee => this.pgToMongo<Payee, MongoPayee>(payee, 'userId'));
  }

  async deletePayee(id: string): Promise<boolean> {
    const result = await db.delete(schema.payees).where(eq(schema.payees.id, parseInt(id)));
    return result.rowCount! > 0;
  }

  // Bill payment operations
  async getBillPaymentsByUserId(userId: string): Promise<MongoBillPayment[]> {
    const result = await db.select().from(schema.billPayments).where(eq(schema.billPayments.userId, parseInt(userId)));
    return result.map(payment => {
      const { id, userId: pgUserId, payeeId, accountId, ...rest } = payment;
      return {
        _id: id.toString(),
        userId: pgUserId.toString(),
        payeeId: payeeId.toString(),
        accountId: accountId.toString(),
        ...rest,
      } as MongoBillPayment;
    });
  }

  async createBillPayment(insertBillPayment: Omit<InsertBillPayment, 'userId' | 'payeeId' | 'accountId'> & { userId: string; payeeId: string; accountId: string }): Promise<MongoBillPayment> {
    const result = await db.insert(schema.billPayments).values({
      ...insertBillPayment,
      userId: parseInt(insertBillPayment.userId),
      payeeId: parseInt(insertBillPayment.payeeId),
      accountId: parseInt(insertBillPayment.accountId),
    }).returning();
    
    const { id, userId, payeeId, accountId, ...rest } = result[0];
    return {
      _id: id.toString(),
      userId: userId.toString(),
      payeeId: payeeId.toString(),
      accountId: accountId.toString(),
      ...rest,
    } as MongoBillPayment;
  }

  async getAllBillPayments(): Promise<MongoBillPayment[]> {
    const result = await db.select().from(schema.billPayments);
    return result.map(payment => {
      const { id, userId, payeeId, accountId, ...rest } = payment;
      return {
        _id: id.toString(),
        userId: userId.toString(),
        payeeId: payeeId.toString(),
        accountId: accountId.toString(),
        ...rest,
      } as MongoBillPayment;
    });
  }

  async deleteBillPayment(id: string): Promise<boolean> {
    const result = await db.delete(schema.billPayments).where(eq(schema.billPayments.id, parseInt(id)));
    return result.rowCount! > 0;
  }

  // Card operations
  async getCardsByUserId(userId: string): Promise<MongoCard[]> {
    const result = await db.select().from(schema.cards).where(eq(schema.cards.userId, parseInt(userId)));
    return result.map(card => {
      const { id, userId: pgUserId, accountId, ...rest } = card;
      return {
        _id: id.toString(),
        userId: pgUserId.toString(),
        accountId: accountId.toString(),
        ...rest,
      } as MongoCard;
    });
  }

  async createCard(insertCard: Omit<InsertCard, 'userId' | 'accountId'> & { userId: string; accountId: string }): Promise<MongoCard> {
    const result = await db.insert(schema.cards).values({
      ...insertCard,
      userId: parseInt(insertCard.userId),
      accountId: parseInt(insertCard.accountId),
    }).returning();
    
    const { id, userId, accountId, ...rest } = result[0];
    return {
      _id: id.toString(),
      userId: userId.toString(),
      accountId: accountId.toString(),
      ...rest,
    } as MongoCard;
  }

  async updateCard(id: string, updateData: Partial<MongoCard>): Promise<MongoCard | null> {
    const { _id, userId, accountId, ...pgUpdateData } = updateData;
    const updateValues: any = { ...pgUpdateData };
    
    if (userId) updateValues.userId = parseInt(userId);
    if (accountId) updateValues.accountId = parseInt(accountId);
    
    const result = await db.update(schema.cards)
      .set(updateValues)
      .where(eq(schema.cards.id, parseInt(id)))
      .returning();
    
    if (result.length === 0) return null;
    
    const { id: resultId, userId: resultUserId, accountId: resultAccountId, ...rest } = result[0];
    return {
      _id: resultId.toString(),
      userId: resultUserId.toString(),
      accountId: resultAccountId.toString(),
      ...rest,
    } as MongoCard;
  }

  async getAllCards(): Promise<MongoCard[]> {
    const result = await db.select().from(schema.cards);
    return result.map(card => {
      const { id, userId, accountId, ...rest } = card;
      return {
        _id: id.toString(),
        userId: userId.toString(),
        accountId: accountId.toString(),
        ...rest,
      } as MongoCard;
    });
  }

  async deleteCard(id: string): Promise<boolean> {
    const result = await db.delete(schema.cards).where(eq(schema.cards.id, parseInt(id)));
    return result.rowCount! > 0;
  }

  // Crypto operations
  async getCryptoHoldingsByUserId(userId: string): Promise<MongoCryptoHolding[]> {
    const result = await db.select().from(schema.cryptoHoldings).where(eq(schema.cryptoHoldings.userId, parseInt(userId)));
    return result.map(holding => this.pgToMongo<CryptoHolding, MongoCryptoHolding>(holding, 'userId'));
  }

  async getCryptoHolding(userId: string, symbol: string): Promise<MongoCryptoHolding | null> {
    const result = await db.select().from(schema.cryptoHoldings)
      .where(and(eq(schema.cryptoHoldings.userId, parseInt(userId)), eq(schema.cryptoHoldings.symbol, symbol)))
      .limit(1);
    
    if (result.length === 0) return null;
    return this.pgToMongo<CryptoHolding, MongoCryptoHolding>(result[0], 'userId');
  }

  async createCryptoHolding(insertCryptoHolding: Omit<InsertCryptoHolding, 'userId'> & { userId: string }): Promise<MongoCryptoHolding> {
    const result = await db.insert(schema.cryptoHoldings).values({
      ...insertCryptoHolding,
      userId: parseInt(insertCryptoHolding.userId),
    }).returning();
    
    return this.pgToMongo<CryptoHolding, MongoCryptoHolding>(result[0], 'userId');
  }

  async updateCryptoHolding(id: string, updateData: Partial<MongoCryptoHolding>): Promise<MongoCryptoHolding | null> {
    const { _id, userId, ...pgUpdateData } = updateData;
    const updateValues: any = { ...pgUpdateData, updatedAt: new Date() };
    
    if (userId) updateValues.userId = parseInt(userId);
    
    const result = await db.update(schema.cryptoHoldings)
      .set(updateValues)
      .where(eq(schema.cryptoHoldings.id, parseInt(id)))
      .returning();
    
    if (result.length === 0) return null;
    return this.pgToMongo<CryptoHolding, MongoCryptoHolding>(result[0], 'userId');
  }

  async getAllCryptoHoldings(): Promise<MongoCryptoHolding[]> {
    const result = await db.select().from(schema.cryptoHoldings);
    return result.map(holding => this.pgToMongo<CryptoHolding, MongoCryptoHolding>(holding, 'userId'));
  }

  async deleteCryptoHolding(id: string): Promise<boolean> {
    const result = await db.delete(schema.cryptoHoldings).where(eq(schema.cryptoHoldings.id, parseInt(id)));
    return result.rowCount! > 0;
  }

  // Notification operations
  async getNotificationsByUserId(userId: string): Promise<MongoNotification[]> {
    const result = await db.select().from(schema.notifications)
      .where(eq(schema.notifications.userId, parseInt(userId)))
      .orderBy(desc(schema.notifications.createdAt));
    
    return result.map(notification => this.pgToMongo<Notification, MongoNotification>(notification, 'userId'));
  }

  async createNotification(insertNotification: Omit<InsertNotification, 'userId'> & { userId: string }): Promise<MongoNotification> {
    const result = await db.insert(schema.notifications).values({
      ...insertNotification,
      userId: parseInt(insertNotification.userId),
    }).returning();
    
    return this.pgToMongo<Notification, MongoNotification>(result[0], 'userId');
  }

  async updateNotification(id: string, updateData: Partial<MongoNotification>): Promise<MongoNotification | null> {
    const { _id, userId, ...pgUpdateData } = updateData;
    const updateValues: any = { ...pgUpdateData };
    
    if (userId) updateValues.userId = parseInt(userId);
    
    const result = await db.update(schema.notifications)
      .set(updateValues)
      .where(eq(schema.notifications.id, parseInt(id)))
      .returning();
    
    if (result.length === 0) return null;
    return this.pgToMongo<Notification, MongoNotification>(result[0], 'userId');
  }

  async getAllNotifications(): Promise<MongoNotification[]> {
    const result = await db.select().from(schema.notifications);
    return result.map(notification => this.pgToMongo<Notification, MongoNotification>(notification, 'userId'));
  }

  async deleteNotification(id: string): Promise<boolean> {
    const result = await db.delete(schema.notifications).where(eq(schema.notifications.id, parseInt(id)));
    return result.rowCount! > 0;
  }

  // Admin operations
  async getAdmin(id: string): Promise<MongoAdmin | null> {
    // Ensure id is a valid integer
    const adminId = parseInt(id);
    if (isNaN(adminId)) {
      throw new Error(`Invalid admin ID: ${id}`);
    }
    
    const result = await db.select().from(schema.admins).where(eq(schema.admins.id, adminId)).limit(1);
    if (result.length === 0) return null;
    return this.pgToMongo<Admin, MongoAdmin>(result[0]);
  }

  async getAdminByEmail(email: string): Promise<MongoAdmin | null> {
    const result = await db.select().from(schema.admins).where(eq(schema.admins.email, email)).limit(1);
    if (result.length === 0) return null;
    return this.pgToMongo<Admin, MongoAdmin>(result[0]);
  }

  async getAdminByUsername(username: string): Promise<MongoAdmin | null> {
    const result = await db.select().from(schema.admins).where(eq(schema.admins.username, username)).limit(1);
    if (result.length === 0) return null;
    return this.pgToMongo<Admin, MongoAdmin>(result[0]);
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<MongoAdmin> {
    const result = await db.insert(schema.admins).values(insertAdmin).returning();
    return this.pgToMongo<Admin, MongoAdmin>(result[0]);
  }

  async updateAdmin(id: string, updateData: Partial<MongoAdmin>): Promise<MongoAdmin | null> {
    const { _id, ...pgUpdateData } = updateData;
    const updateValues = { ...pgUpdateData, updatedAt: new Date() };
    
    // Ensure id is a valid integer
    const adminId = parseInt(id);
    if (isNaN(adminId)) {
      throw new Error(`Invalid admin ID: ${id}`);
    }
    
    const result = await db.update(schema.admins)
      .set(updateValues)
      .where(eq(schema.admins.id, adminId))
      .returning();
    
    if (result.length === 0) return null;
    return this.pgToMongo<Admin, MongoAdmin>(result[0]);
  }

  async getAllAdmins(): Promise<MongoAdmin[]> {
    const result = await db.select().from(schema.admins);
    return result.map(admin => this.pgToMongo<Admin, MongoAdmin>(admin));
  }

  async deleteAdmin(id: string): Promise<boolean> {
    const result = await db.delete(schema.admins).where(eq(schema.admins.id, parseInt(id)));
    return result.rowCount! > 0;
  }
}
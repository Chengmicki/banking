import {
  type User, type InsertUser, type Account, type InsertAccount, type Transaction, type InsertTransaction,
  type Transfer, type InsertTransfer, type Payee, type InsertPayee, type BillPayment, type InsertBillPayment,
  type Card, type InsertCard, type CryptoHolding, type InsertCryptoHolding, type Notification, type InsertNotification,
  type Admin, type InsertAdmin
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User | null>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: string): Promise<boolean>;
  
  // Account operations
  getAccountsByUserId(userId: string): Promise<Account[]>;
  getAccount(id: string): Promise<Account | null>;
  createAccount(account: InsertAccount): Promise<Account>;
  updateAccount(id: string, account: Partial<Account>): Promise<Account | null>;
  getAllAccounts(): Promise<Account[]>;
  deleteAccount(id: string): Promise<boolean>;
  
  // Transaction operations
  getTransactionsByAccountId(accountId: string, limit?: number): Promise<Transaction[]>;
  getTransactionsByUserId(userId: string, limit?: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getAllTransactions(): Promise<Transaction[]>;
  deleteTransaction(id: string): Promise<boolean>;
  
  // Transfer operations
  getTransfersByUserId(userId: string, limit?: number): Promise<Transfer[]>;
  createTransfer(transfer: InsertTransfer): Promise<Transfer>;
  updateTransfer(id: string, transfer: Partial<Transfer>): Promise<Transfer | null>;
  getAllTransfers(): Promise<Transfer[]>;
  deleteTransfer(id: string): Promise<boolean>;
  
  // Payee operations
  getPayeesByUserId(userId: string): Promise<Payee[]>;
  createPayee(payee: InsertPayee): Promise<Payee>;
  getAllPayees(): Promise<Payee[]>;
  deletePayee(id: string): Promise<boolean>;
  
  // Bill payment operations
  getBillPaymentsByUserId(userId: string): Promise<BillPayment[]>;
  createBillPayment(billPayment: InsertBillPayment): Promise<BillPayment>;
  getAllBillPayments(): Promise<BillPayment[]>;
  deleteBillPayment(id: string): Promise<boolean>;
  
  // Card operations
  getCardsByUserId(userId: string): Promise<Card[]>;
  createCard(card: InsertCard): Promise<Card>;
  updateCard(id: string, card: Partial<Card>): Promise<Card | null>;
  getAllCards(): Promise<Card[]>;
  deleteCard(id: string): Promise<boolean>;
  
  // Crypto operations
  getCryptoHoldingsByUserId(userId: string): Promise<CryptoHolding[]>;
  getCryptoHolding(userId: string, symbol: string): Promise<CryptoHolding | null>;
  createCryptoHolding(holding: InsertCryptoHolding): Promise<CryptoHolding>;
  updateCryptoHolding(id: string, holding: Partial<CryptoHolding>): Promise<CryptoHolding | null>;
  getAllCryptoHoldings(): Promise<CryptoHolding[]>;
  deleteCryptoHolding(id: string): Promise<boolean>;
  
  // Notification operations
  getNotificationsByUserId(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  updateNotification(id: string, notification: Partial<Notification>): Promise<Notification | null>;
  getAllNotifications(): Promise<Notification[]>;
  deleteNotification(id: string): Promise<boolean>;

  // Admin operations
  getAdmin(id: string): Promise<Admin | null>;
  getAdminByEmail(email: string): Promise<Admin | null>;
  getAdminByUsername(username: string): Promise<Admin | null>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  updateAdmin(id: string, admin: Partial<Admin>): Promise<Admin | null>;
  getAllAdmins(): Promise<Admin[]>;
  deleteAdmin(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private accounts: Map<string, Account> = new Map();
  private transactions: Map<string, Transaction> = new Map();
  private transfers: Map<string, Transfer> = new Map();
  private payees: Map<string, Payee> = new Map();
  private billPayments: Map<string, BillPayment> = new Map();
  private cards: Map<string, Card> = new Map();
  private cryptoHoldings: Map<string, CryptoHolding> = new Map();
  private notifications: Map<string, Notification> = new Map();
  private admins: Map<string, Admin> = new Map();
  
  private currentUserId = 1;
  private currentAccountId = 1;
  private currentTransactionId = 1;
  private currentTransferId = 1;
  private currentPayeeId = 1;
  private currentBillPaymentId = 1;
  private currentCardId = 1;
  private currentCryptoHoldingId = 1;
  private currentNotificationId = 1;
  private currentAdminId = 1;

  // User operations
  async getUser(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return Array.from(this.users.values()).find(user => user.email === email) || null;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = (this.currentUserId++).toString();
    const user: User = {
      _id: id,
      ...insertUser,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updateData: Partial<User>): Promise<User | null> {
    const user = this.users.get(id);
    if (!user) return null;

    const updatedUser = { ...user, ...updateData, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  // Account operations
  async getAccountsByUserId(userId: string): Promise<Account[]> {
    return Array.from(this.accounts.values()).filter(account => account.userId === userId);
  }

  async getAccount(id: string): Promise<Account | null> {
    return this.accounts.get(id) || null;
  }

  async createAccount(insertAccount: InsertAccount): Promise<Account> {
    const id = (this.currentAccountId++).toString();
    const account: Account = {
      _id: id,
      ...insertAccount,
      createdAt: new Date(),
    };
    this.accounts.set(id, account);
    return account;
  }

  async updateAccount(id: string, updateData: Partial<Account>): Promise<Account | null> {
    const account = this.accounts.get(id);
    if (!account) return null;
    
    const updatedAccount = { ...account, ...updateData };
    this.accounts.set(id, updatedAccount);
    return updatedAccount;
  }

  async getAllAccounts(): Promise<Account[]> {
    return Array.from(this.accounts.values());
  }

  async deleteAccount(id: string): Promise<boolean> {
    return this.accounts.delete(id);
  }

  // Transaction operations
  async getTransactionsByAccountId(accountId: string, limit: number = 50): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => transaction.accountId === accountId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime())
      .slice(0, limit);
  }

  async getTransactionsByUserId(userId: string, limit: number = 50): Promise<Transaction[]> {
    const userAccounts = await this.getAccountsByUserId(userId);
    const accountIds = userAccounts.map(account => account._id!);
    
    return Array.from(this.transactions.values())
      .filter(transaction => accountIds.includes(transaction.accountId))
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime())
      .slice(0, limit);
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = (this.currentTransactionId++).toString();
    const transaction: Transaction = {
      _id: id,
      ...insertTransaction,
      createdAt: new Date(),
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values());
  }

  async deleteTransaction(id: string): Promise<boolean> {
    return this.transactions.delete(id);
  }

  // Transfer operations
  async getTransfersByUserId(userId: string, limit: number = 50): Promise<Transfer[]> {
    const userAccounts = await this.getAccountsByUserId(userId);
    const accountIds = userAccounts.map(account => account._id!);
    
    return Array.from(this.transfers.values())
      .filter(transfer => accountIds.includes(transfer.fromAccountId))
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime())
      .slice(0, limit);
  }

  async createTransfer(insertTransfer: InsertTransfer): Promise<Transfer> {
    const id = (this.currentTransferId++).toString();
    const transfer: Transfer = {
      _id: id,
      ...insertTransfer,
      createdAt: new Date(),
    };
    this.transfers.set(id, transfer);
    return transfer;
  }

  async updateTransfer(id: string, updateData: Partial<Transfer>): Promise<Transfer | null> {
    const transfer = this.transfers.get(id);
    if (!transfer) return null;
    
    const updatedTransfer = { ...transfer, ...updateData };
    this.transfers.set(id, updatedTransfer);
    return updatedTransfer;
  }

  async getAllTransfers(): Promise<Transfer[]> {
    return Array.from(this.transfers.values());
  }

  async deleteTransfer(id: string): Promise<boolean> {
    return this.transfers.delete(id);
  }

  // Payee operations
  async getPayeesByUserId(userId: string): Promise<Payee[]> {
    return Array.from(this.payees.values()).filter(payee => payee.userId === userId);
  }

  async createPayee(insertPayee: InsertPayee): Promise<Payee> {
    const id = (this.currentPayeeId++).toString();
    const payee: Payee = {
      _id: id,
      ...insertPayee,
      createdAt: new Date(),
    };
    this.payees.set(id, payee);
    return payee;
  }

  async getAllPayees(): Promise<Payee[]> {
    return Array.from(this.payees.values());
  }

  async deletePayee(id: string): Promise<boolean> {
    return this.payees.delete(id);
  }

  // Bill payment operations
  async getBillPaymentsByUserId(userId: string): Promise<BillPayment[]> {
    return Array.from(this.billPayments.values()).filter(payment => payment.userId === userId);
  }

  async createBillPayment(insertBillPayment: InsertBillPayment): Promise<BillPayment> {
    const id = (this.currentBillPaymentId++).toString();
    const billPayment: BillPayment = {
      _id: id,
      ...insertBillPayment,
      createdAt: new Date(),
    };
    this.billPayments.set(id, billPayment);
    return billPayment;
  }

  async getAllBillPayments(): Promise<BillPayment[]> {
    return Array.from(this.billPayments.values());
  }

  async deleteBillPayment(id: string): Promise<boolean> {
    return this.billPayments.delete(id);
  }

  // Card operations
  async getCardsByUserId(userId: string): Promise<Card[]> {
    return Array.from(this.cards.values()).filter(card => card.userId === userId);
  }

  async createCard(insertCard: InsertCard): Promise<Card> {
    const id = (this.currentCardId++).toString();
    const card: Card = {
      _id: id,
      ...insertCard,
      createdAt: new Date(),
    };
    this.cards.set(id, card);
    return card;
  }

  async updateCard(id: string, updateData: Partial<Card>): Promise<Card | null> {
    const card = this.cards.get(id);
    if (!card) return null;
    
    const updatedCard = { ...card, ...updateData };
    this.cards.set(id, updatedCard);
    return updatedCard;
  }

  async getAllCards(): Promise<Card[]> {
    return Array.from(this.cards.values());
  }

  async deleteCard(id: string): Promise<boolean> {
    return this.cards.delete(id);
  }

  // Crypto operations
  async getCryptoHoldingsByUserId(userId: string): Promise<CryptoHolding[]> {
    return Array.from(this.cryptoHoldings.values()).filter(holding => holding.userId === userId);
  }

  async getCryptoHolding(userId: string, symbol: string): Promise<CryptoHolding | null> {
    return Array.from(this.cryptoHoldings.values())
      .find(holding => holding.userId === userId && holding.symbol === symbol) || null;
  }

  async createCryptoHolding(insertCryptoHolding: InsertCryptoHolding): Promise<CryptoHolding> {
    const id = (this.currentCryptoHoldingId++).toString();
    const holding: CryptoHolding = {
      _id: id,
      ...insertCryptoHolding,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.cryptoHoldings.set(id, holding);
    return holding;
  }

  async updateCryptoHolding(id: string, updateData: Partial<CryptoHolding>): Promise<CryptoHolding | null> {
    const holding = this.cryptoHoldings.get(id);
    if (!holding) return null;
    
    const updatedHolding = { ...holding, ...updateData, updatedAt: new Date() };
    this.cryptoHoldings.set(id, updatedHolding);
    return updatedHolding;
  }

  async getAllCryptoHoldings(): Promise<CryptoHolding[]> {
    return Array.from(this.cryptoHoldings.values());
  }

  async deleteCryptoHolding(id: string): Promise<boolean> {
    return this.cryptoHoldings.delete(id);
  }

  // Notification operations
  async getNotificationsByUserId(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = (this.currentNotificationId++).toString();
    const notification: Notification = {
      _id: id,
      ...insertNotification,
      createdAt: new Date(),
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async updateNotification(id: string, updateData: Partial<Notification>): Promise<Notification | null> {
    const notification = this.notifications.get(id);
    if (!notification) return null;
    
    const updatedNotification = { ...notification, ...updateData };
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }

  async getAllNotifications(): Promise<Notification[]> {
    return Array.from(this.notifications.values());
  }

  async deleteNotification(id: string): Promise<boolean> {
    return this.notifications.delete(id);
  }

  // Admin operations
  async getAdmin(id: string): Promise<Admin | null> {
    return this.admins.get(id) || null;
  }

  async getAdminByEmail(email: string): Promise<Admin | null> {
    return Array.from(this.admins.values()).find(admin => admin.email === email) || null;
  }

  async getAdminByUsername(username: string): Promise<Admin | null> {
    return Array.from(this.admins.values()).find(admin => admin.username === username) || null;
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    const id = (this.currentAdminId++).toString();
    const admin: Admin = {
      _id: id,
      ...insertAdmin,
      createdAt: new Date(),
    };
    this.admins.set(id, admin);
    return admin;
  }

  async updateAdmin(id: string, updateData: Partial<Admin>): Promise<Admin | null> {
    const admin = this.admins.get(id);
    if (!admin) return null;
    
    const updatedAdmin = { ...admin, ...updateData };
    this.admins.set(id, updatedAdmin);
    return updatedAdmin;
  }

  async getAllAdmins(): Promise<Admin[]> {
    return Array.from(this.admins.values());
  }

  async deleteAdmin(id: string): Promise<boolean> {
    return this.admins.delete(id);
  }
}

export const storage = new MemStorage();
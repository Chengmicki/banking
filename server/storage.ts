import { 
  users, accounts, transactions, transfers, payees, billPayments, cards, cryptoHoldings, notifications,
  type User, type InsertUser, type Account, type InsertAccount, type Transaction, type InsertTransaction,
  type Transfer, type InsertTransfer, type Payee, type InsertPayee, type BillPayment, type InsertBillPayment,
  type Card, type InsertCard, type CryptoHolding, type InsertCryptoHolding, type Notification, type InsertNotification
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User>;
  
  // Account operations
  getAccountsByUserId(userId: number): Promise<Account[]>;
  getAccount(id: number): Promise<Account | undefined>;
  createAccount(account: InsertAccount): Promise<Account>;
  updateAccount(id: number, account: Partial<Account>): Promise<Account>;
  
  // Transaction operations
  getTransactionsByAccountId(accountId: number, limit?: number): Promise<Transaction[]>;
  getTransactionsByUserId(userId: number, limit?: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Transfer operations
  getTransfersByUserId(userId: number, limit?: number): Promise<Transfer[]>;
  createTransfer(transfer: InsertTransfer): Promise<Transfer>;
  updateTransfer(id: number, transfer: Partial<Transfer>): Promise<Transfer>;
  
  // Payee operations
  getPayeesByUserId(userId: number): Promise<Payee[]>;
  createPayee(payee: InsertPayee): Promise<Payee>;
  
  // Bill payment operations
  getBillPaymentsByUserId(userId: number): Promise<BillPayment[]>;
  createBillPayment(billPayment: InsertBillPayment): Promise<BillPayment>;
  
  // Card operations
  getCardsByUserId(userId: number): Promise<Card[]>;
  createCard(card: InsertCard): Promise<Card>;
  updateCard(id: number, card: Partial<Card>): Promise<Card>;
  
  // Crypto operations
  getCryptoHoldingsByUserId(userId: number): Promise<CryptoHolding[]>;
  getCryptoHolding(userId: number, symbol: string): Promise<CryptoHolding | undefined>;
  createCryptoHolding(holding: InsertCryptoHolding): Promise<CryptoHolding>;
  updateCryptoHolding(id: number, holding: Partial<CryptoHolding>): Promise<CryptoHolding>;
  
  // Notification operations
  getNotificationsByUserId(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  updateNotification(id: number, notification: Partial<Notification>): Promise<Notification>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private accounts: Map<number, Account> = new Map();
  private transactions: Map<number, Transaction> = new Map();
  private transfers: Map<number, Transfer> = new Map();
  private payees: Map<number, Payee> = new Map();
  private billPayments: Map<number, BillPayment> = new Map();
  private cards: Map<number, Card> = new Map();
  private cryptoHoldings: Map<number, CryptoHolding> = new Map();
  private notifications: Map<number, Notification> = new Map();
  
  private currentUserId = 1;
  private currentAccountId = 1;
  private currentTransactionId = 1;
  private currentTransferId = 1;
  private currentPayeeId = 1;
  private currentBillPaymentId = 1;
  private currentCardId = 1;
  private currentCryptoHoldingId = 1;
  private currentNotificationId = 1;

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updateData: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, ...updateData, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Account operations
  async getAccountsByUserId(userId: number): Promise<Account[]> {
    return Array.from(this.accounts.values()).filter(account => account.userId === userId);
  }

  async getAccount(id: number): Promise<Account | undefined> {
    return this.accounts.get(id);
  }

  async createAccount(insertAccount: InsertAccount): Promise<Account> {
    const id = this.currentAccountId++;
    const account: Account = {
      ...insertAccount,
      id,
      createdAt: new Date(),
    };
    this.accounts.set(id, account);
    return account;
  }

  async updateAccount(id: number, updateData: Partial<Account>): Promise<Account> {
    const account = this.accounts.get(id);
    if (!account) throw new Error("Account not found");
    
    const updatedAccount = { ...account, ...updateData };
    this.accounts.set(id, updatedAccount);
    return updatedAccount;
  }

  // Transaction operations
  async getTransactionsByAccountId(accountId: number, limit: number = 50): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => transaction.accountId === accountId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime())
      .slice(0, limit);
  }

  async getTransactionsByUserId(userId: number, limit: number = 50): Promise<Transaction[]> {
    const userAccounts = await this.getAccountsByUserId(userId);
    const accountIds = userAccounts.map(account => account.id);
    
    return Array.from(this.transactions.values())
      .filter(transaction => accountIds.includes(transaction.accountId))
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime())
      .slice(0, limit);
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      createdAt: new Date(),
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  // Transfer operations
  async getTransfersByUserId(userId: number, limit: number = 50): Promise<Transfer[]> {
    const userAccounts = await this.getAccountsByUserId(userId);
    const accountIds = userAccounts.map(account => account.id);
    
    return Array.from(this.transfers.values())
      .filter(transfer => accountIds.includes(transfer.fromAccountId))
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime())
      .slice(0, limit);
  }

  async createTransfer(insertTransfer: InsertTransfer): Promise<Transfer> {
    const id = this.currentTransferId++;
    const transfer: Transfer = {
      ...insertTransfer,
      id,
      createdAt: new Date(),
    };
    this.transfers.set(id, transfer);
    return transfer;
  }

  async updateTransfer(id: number, updateData: Partial<Transfer>): Promise<Transfer> {
    const transfer = this.transfers.get(id);
    if (!transfer) throw new Error("Transfer not found");
    
    const updatedTransfer = { ...transfer, ...updateData };
    this.transfers.set(id, updatedTransfer);
    return updatedTransfer;
  }

  // Payee operations
  async getPayeesByUserId(userId: number): Promise<Payee[]> {
    return Array.from(this.payees.values()).filter(payee => payee.userId === userId);
  }

  async createPayee(insertPayee: InsertPayee): Promise<Payee> {
    const id = this.currentPayeeId++;
    const payee: Payee = {
      ...insertPayee,
      id,
      createdAt: new Date(),
    };
    this.payees.set(id, payee);
    return payee;
  }

  // Bill payment operations
  async getBillPaymentsByUserId(userId: number): Promise<BillPayment[]> {
    return Array.from(this.billPayments.values()).filter(payment => payment.userId === userId);
  }

  async createBillPayment(insertBillPayment: InsertBillPayment): Promise<BillPayment> {
    const id = this.currentBillPaymentId++;
    const billPayment: BillPayment = {
      ...insertBillPayment,
      id,
      createdAt: new Date(),
    };
    this.billPayments.set(id, billPayment);
    return billPayment;
  }

  // Card operations
  async getCardsByUserId(userId: number): Promise<Card[]> {
    return Array.from(this.cards.values()).filter(card => card.userId === userId);
  }

  async createCard(insertCard: InsertCard): Promise<Card> {
    const id = this.currentCardId++;
    const card: Card = {
      ...insertCard,
      id,
      createdAt: new Date(),
    };
    this.cards.set(id, card);
    return card;
  }

  async updateCard(id: number, updateData: Partial<Card>): Promise<Card> {
    const card = this.cards.get(id);
    if (!card) throw new Error("Card not found");
    
    const updatedCard = { ...card, ...updateData };
    this.cards.set(id, updatedCard);
    return updatedCard;
  }

  // Crypto operations
  async getCryptoHoldingsByUserId(userId: number): Promise<CryptoHolding[]> {
    return Array.from(this.cryptoHoldings.values()).filter(holding => holding.userId === userId);
  }

  async getCryptoHolding(userId: number, symbol: string): Promise<CryptoHolding | undefined> {
    return Array.from(this.cryptoHoldings.values()).find(
      holding => holding.userId === userId && holding.symbol === symbol
    );
  }

  async createCryptoHolding(insertCryptoHolding: InsertCryptoHolding): Promise<CryptoHolding> {
    const id = this.currentCryptoHoldingId++;
    const holding: CryptoHolding = {
      ...insertCryptoHolding,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.cryptoHoldings.set(id, holding);
    return holding;
  }

  async updateCryptoHolding(id: number, updateData: Partial<CryptoHolding>): Promise<CryptoHolding> {
    const holding = this.cryptoHoldings.get(id);
    if (!holding) throw new Error("Crypto holding not found");
    
    const updatedHolding = { ...holding, ...updateData, updatedAt: new Date() };
    this.cryptoHoldings.set(id, updatedHolding);
    return updatedHolding;
  }

  // Notification operations
  async getNotificationsByUserId(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = this.currentNotificationId++;
    const notification: Notification = {
      ...insertNotification,
      id,
      createdAt: new Date(),
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async updateNotification(id: number, updateData: Partial<Notification>): Promise<Notification> {
    const notification = this.notifications.get(id);
    if (!notification) throw new Error("Notification not found");
    
    const updatedNotification = { ...notification, ...updateData };
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }
}

export const storage = new MemStorage();

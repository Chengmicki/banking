import { 
  User, Account, Transaction, Transfer, Payee, BillPayment, Card, CryptoHolding, Notification, Admin 
} from "./models/index";
import {
  type User as UserType, type InsertUser, type Account as AccountType, type InsertAccount, 
  type Transaction as TransactionType, type InsertTransaction, type Transfer as TransferType, 
  type InsertTransfer, type Payee as PayeeType, type InsertPayee, type BillPayment as BillPaymentType,
  type InsertBillPayment, type Card as CardType, type InsertCard, type CryptoHolding as CryptoHoldingType,
  type InsertCryptoHolding, type Notification as NotificationType, type InsertNotification,
  type Admin as AdminType, type InsertAdmin
} from "@shared/mongodb-schema";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<UserType | null>;
  getUserByEmail(email: string): Promise<UserType | null>;
  createUser(user: InsertUser): Promise<UserType>;
  updateUser(id: string, user: Partial<UserType>): Promise<UserType | null>;
  getAllUsers(): Promise<UserType[]>;
  deleteUser(id: string): Promise<boolean>;
  
  // Account operations
  getAccountsByUserId(userId: string): Promise<AccountType[]>;
  getAccount(id: string): Promise<AccountType | null>;
  createAccount(account: InsertAccount): Promise<AccountType>;
  updateAccount(id: string, account: Partial<AccountType>): Promise<AccountType | null>;
  getAllAccounts(): Promise<AccountType[]>;
  deleteAccount(id: string): Promise<boolean>;
  
  // Transaction operations
  getTransactionsByAccountId(accountId: string, limit?: number): Promise<TransactionType[]>;
  getTransactionsByUserId(userId: string, limit?: number): Promise<TransactionType[]>;
  createTransaction(transaction: InsertTransaction): Promise<TransactionType>;
  getAllTransactions(): Promise<TransactionType[]>;
  deleteTransaction(id: string): Promise<boolean>;
  
  // Transfer operations
  getTransfersByUserId(userId: string, limit?: number): Promise<TransferType[]>;
  createTransfer(transfer: InsertTransfer): Promise<TransferType>;
  updateTransfer(id: string, transfer: Partial<TransferType>): Promise<TransferType | null>;
  getAllTransfers(): Promise<TransferType[]>;
  deleteTransfer(id: string): Promise<boolean>;
  
  // Payee operations
  getPayeesByUserId(userId: string): Promise<PayeeType[]>;
  createPayee(payee: InsertPayee): Promise<PayeeType>;
  getAllPayees(): Promise<PayeeType[]>;
  deletePayee(id: string): Promise<boolean>;
  
  // Bill payment operations
  getBillPaymentsByUserId(userId: string): Promise<BillPaymentType[]>;
  createBillPayment(billPayment: InsertBillPayment): Promise<BillPaymentType>;
  getAllBillPayments(): Promise<BillPaymentType[]>;
  deleteBillPayment(id: string): Promise<boolean>;
  
  // Card operations
  getCardsByUserId(userId: string): Promise<CardType[]>;
  createCard(card: InsertCard): Promise<CardType>;
  updateCard(id: string, card: Partial<CardType>): Promise<CardType | null>;
  getAllCards(): Promise<CardType[]>;
  deleteCard(id: string): Promise<boolean>;
  
  // Crypto operations
  getCryptoHoldingsByUserId(userId: string): Promise<CryptoHoldingType[]>;
  getCryptoHolding(userId: string, symbol: string): Promise<CryptoHoldingType | null>;
  createCryptoHolding(holding: InsertCryptoHolding): Promise<CryptoHoldingType>;
  updateCryptoHolding(id: string, holding: Partial<CryptoHoldingType>): Promise<CryptoHoldingType | null>;
  getAllCryptoHoldings(): Promise<CryptoHoldingType[]>;
  deleteCryptoHolding(id: string): Promise<boolean>;
  
  // Notification operations
  getNotificationsByUserId(userId: string): Promise<NotificationType[]>;
  createNotification(notification: InsertNotification): Promise<NotificationType>;
  updateNotification(id: string, notification: Partial<NotificationType>): Promise<NotificationType | null>;
  getAllNotifications(): Promise<NotificationType[]>;
  deleteNotification(id: string): Promise<boolean>;

  // Admin operations
  getAdmin(id: string): Promise<AdminType | null>;
  getAdminByEmail(email: string): Promise<AdminType | null>;
  getAdminByUsername(username: string): Promise<AdminType | null>;
  createAdmin(admin: InsertAdmin): Promise<AdminType>;
  updateAdmin(id: string, admin: Partial<AdminType>): Promise<AdminType | null>;
  getAllAdmins(): Promise<AdminType[]>;
  deleteAdmin(id: string): Promise<boolean>;
}

export class MongoStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<UserType | null> {
    const user = await User.findById(id);
    return user ? user.toObject() : null;
  }

  async getUserByEmail(email: string): Promise<UserType | null> {
    const user = await User.findOne({ email });
    return user ? user.toObject() : null;
  }

  async createUser(insertUser: InsertUser): Promise<UserType> {
    const user = new User(insertUser);
    await user.save();
    return user.toObject();
  }

  async updateUser(id: string, updateData: Partial<UserType>): Promise<UserType | null> {
    const user = await User.findByIdAndUpdate(
      id, 
      { ...updateData, updatedAt: new Date() }, 
      { new: true }
    );
    return user ? user.toObject() : null;
  }

  async getAllUsers(): Promise<UserType[]> {
    const users = await User.find();
    return users.map(user => user.toObject());
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await User.findByIdAndDelete(id);
    return !!result;
  }

  // Account operations
  async getAccountsByUserId(userId: string): Promise<AccountType[]> {
    const accounts = await Account.find({ userId });
    return accounts.map(account => account.toObject());
  }

  async getAccount(id: string): Promise<AccountType | null> {
    const account = await Account.findById(id);
    return account ? account.toObject() : null;
  }

  async createAccount(insertAccount: InsertAccount): Promise<AccountType> {
    const account = new Account(insertAccount);
    await account.save();
    return account.toObject();
  }

  async updateAccount(id: string, updateData: Partial<AccountType>): Promise<AccountType | null> {
    const account = await Account.findByIdAndUpdate(id, updateData, { new: true });
    return account ? account.toObject() : null;
  }

  async getAllAccounts(): Promise<AccountType[]> {
    const accounts = await Account.find().populate('userId', 'fullName email');
    return accounts.map(account => account.toObject());
  }

  async deleteAccount(id: string): Promise<boolean> {
    const result = await Account.findByIdAndDelete(id);
    return !!result;
  }

  // Transaction operations
  async getTransactionsByAccountId(accountId: string, limit: number = 50): Promise<TransactionType[]> {
    const transactions = await Transaction.find({ accountId })
      .sort({ createdAt: -1 })
      .limit(limit);
    return transactions.map(transaction => transaction.toObject());
  }

  async getTransactionsByUserId(userId: string, limit: number = 50): Promise<TransactionType[]> {
    const accounts = await Account.find({ userId });
    const accountIds = accounts.map(account => account._id);
    
    const transactions = await Transaction.find({ accountId: { $in: accountIds } })
      .sort({ createdAt: -1 })
      .limit(limit);
    return transactions.map(transaction => transaction.toObject());
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<TransactionType> {
    const transaction = new Transaction(insertTransaction);
    await transaction.save();
    return transaction.toObject();
  }

  async getAllTransactions(): Promise<TransactionType[]> {
    const transactions = await Transaction.find().populate('accountId', 'accountNumber accountType');
    return transactions.map(transaction => transaction.toObject());
  }

  async deleteTransaction(id: string): Promise<boolean> {
    const result = await Transaction.findByIdAndDelete(id);
    return !!result;
  }

  // Transfer operations
  async getTransfersByUserId(userId: string, limit: number = 50): Promise<TransferType[]> {
    const accounts = await Account.find({ userId });
    const accountIds = accounts.map(account => account._id);
    
    const transfers = await Transfer.find({ fromAccountId: { $in: accountIds } })
      .sort({ createdAt: -1 })
      .limit(limit);
    return transfers.map(transfer => transfer.toObject());
  }

  async createTransfer(insertTransfer: InsertTransfer): Promise<TransferType> {
    const transfer = new Transfer(insertTransfer);
    await transfer.save();
    return transfer.toObject();
  }

  async updateTransfer(id: string, updateData: Partial<TransferType>): Promise<TransferType | null> {
    const transfer = await Transfer.findByIdAndUpdate(id, updateData, { new: true });
    return transfer ? transfer.toObject() : null;
  }

  async getAllTransfers(): Promise<TransferType[]> {
    const transfers = await Transfer.find()
      .populate('fromAccountId', 'accountNumber accountType')
      .populate('toAccountId', 'accountNumber accountType');
    return transfers.map(transfer => transfer.toObject());
  }

  async deleteTransfer(id: string): Promise<boolean> {
    const result = await Transfer.findByIdAndDelete(id);
    return !!result;
  }

  // Payee operations
  async getPayeesByUserId(userId: string): Promise<PayeeType[]> {
    const payees = await Payee.find({ userId });
    return payees.map(payee => payee.toObject());
  }

  async createPayee(insertPayee: InsertPayee): Promise<PayeeType> {
    const payee = new Payee(insertPayee);
    await payee.save();
    return payee.toObject();
  }

  async getAllPayees(): Promise<PayeeType[]> {
    const payees = await Payee.find().populate('userId', 'fullName email');
    return payees.map(payee => payee.toObject());
  }

  async deletePayee(id: string): Promise<boolean> {
    const result = await Payee.findByIdAndDelete(id);
    return !!result;
  }

  // Bill payment operations
  async getBillPaymentsByUserId(userId: string): Promise<BillPaymentType[]> {
    const billPayments = await BillPayment.find({ userId })
      .populate('payeeId', 'name category')
      .populate('accountId', 'accountNumber accountType');
    return billPayments.map(payment => payment.toObject());
  }

  async createBillPayment(insertBillPayment: InsertBillPayment): Promise<BillPaymentType> {
    const billPayment = new BillPayment(insertBillPayment);
    await billPayment.save();
    return billPayment.toObject();
  }

  async getAllBillPayments(): Promise<BillPaymentType[]> {
    const billPayments = await BillPayment.find()
      .populate('userId', 'fullName email')
      .populate('payeeId', 'name category')
      .populate('accountId', 'accountNumber accountType');
    return billPayments.map(payment => payment.toObject());
  }

  async deleteBillPayment(id: string): Promise<boolean> {
    const result = await BillPayment.findByIdAndDelete(id);
    return !!result;
  }

  // Card operations
  async getCardsByUserId(userId: string): Promise<CardType[]> {
    const cards = await Card.find({ userId });
    return cards.map(card => card.toObject());
  }

  async createCard(insertCard: InsertCard): Promise<CardType> {
    const card = new Card(insertCard);
    await card.save();
    return card.toObject();
  }

  async updateCard(id: string, updateData: Partial<CardType>): Promise<CardType | null> {
    const card = await Card.findByIdAndUpdate(id, updateData, { new: true });
    return card ? card.toObject() : null;
  }

  async getAllCards(): Promise<CardType[]> {
    const cards = await Card.find()
      .populate('userId', 'fullName email')
      .populate('accountId', 'accountNumber accountType');
    return cards.map(card => card.toObject());
  }

  async deleteCard(id: string): Promise<boolean> {
    const result = await Card.findByIdAndDelete(id);
    return !!result;
  }

  // Crypto operations
  async getCryptoHoldingsByUserId(userId: string): Promise<CryptoHoldingType[]> {
    const holdings = await CryptoHolding.find({ userId });
    return holdings.map(holding => holding.toObject());
  }

  async getCryptoHolding(userId: string, symbol: string): Promise<CryptoHoldingType | null> {
    const holding = await CryptoHolding.findOne({ userId, symbol });
    return holding ? holding.toObject() : null;
  }

  async createCryptoHolding(insertCryptoHolding: InsertCryptoHolding): Promise<CryptoHoldingType> {
    const holding = new CryptoHolding(insertCryptoHolding);
    await holding.save();
    return holding.toObject();
  }

  async updateCryptoHolding(id: string, updateData: Partial<CryptoHoldingType>): Promise<CryptoHoldingType | null> {
    const holding = await CryptoHolding.findByIdAndUpdate(
      id, 
      { ...updateData, updatedAt: new Date() }, 
      { new: true }
    );
    return holding ? holding.toObject() : null;
  }

  async getAllCryptoHoldings(): Promise<CryptoHoldingType[]> {
    const holdings = await CryptoHolding.find().populate('userId', 'fullName email');
    return holdings.map(holding => holding.toObject());
  }

  async deleteCryptoHolding(id: string): Promise<boolean> {
    const result = await CryptoHolding.findByIdAndDelete(id);
    return !!result;
  }

  // Notification operations
  async getNotificationsByUserId(userId: string): Promise<NotificationType[]> {
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    return notifications.map(notification => notification.toObject());
  }

  async createNotification(insertNotification: InsertNotification): Promise<NotificationType> {
    const notification = new Notification(insertNotification);
    await notification.save();
    return notification.toObject();
  }

  async updateNotification(id: string, updateData: Partial<NotificationType>): Promise<NotificationType | null> {
    const notification = await Notification.findByIdAndUpdate(id, updateData, { new: true });
    return notification ? notification.toObject() : null;
  }

  async getAllNotifications(): Promise<NotificationType[]> {
    const notifications = await Notification.find().populate('userId', 'fullName email');
    return notifications.map(notification => notification.toObject());
  }

  async deleteNotification(id: string): Promise<boolean> {
    const result = await Notification.findByIdAndDelete(id);
    return !!result;
  }

  // Admin operations
  async getAdmin(id: string): Promise<AdminType | null> {
    const admin = await Admin.findById(id);
    return admin ? admin.toObject() : null;
  }

  async getAdminByEmail(email: string): Promise<AdminType | null> {
    const admin = await Admin.findOne({ email });
    return admin ? admin.toObject() : null;
  }

  async getAdminByUsername(username: string): Promise<AdminType | null> {
    const admin = await Admin.findOne({ username });
    return admin ? admin.toObject() : null;
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<AdminType> {
    const admin = new Admin(insertAdmin);
    await admin.save();
    return admin.toObject();
  }

  async updateAdmin(id: string, updateData: Partial<AdminType>): Promise<AdminType | null> {
    const admin = await Admin.findByIdAndUpdate(id, updateData, { new: true });
    return admin ? admin.toObject() : null;
  }

  async getAllAdmins(): Promise<AdminType[]> {
    const admins = await Admin.find();
    return admins.map(admin => admin.toObject());
  }

  async deleteAdmin(id: string): Promise<boolean> {
    const result = await Admin.findByIdAndDelete(id);
    return !!result;
  }
}

export const storage = new MongoStorage();
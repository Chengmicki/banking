import { z } from "zod";

// User Schema
export const userSchema = z.object({
  _id: z.string().optional(),
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
  address: z.string().optional(),
  isVerified: z.boolean().default(false),
  isAdmin: z.boolean().default(false),
  stripeCustomerId: z.string().optional(),
  stripeSubscriptionId: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

// Account Schema
export const accountSchema = z.object({
  _id: z.string().optional(),
  userId: z.string(),
  accountNumber: z.string(),
  accountType: z.enum(["checking", "savings", "credit"]),
  balance: z.string().default("0.00"),
  isActive: z.boolean().default(true),
  createdAt: z.date().default(() => new Date()),
});

// Transaction Schema
export const transactionSchema = z.object({
  _id: z.string().optional(),
  accountId: z.string(),
  type: z.enum(["deposit", "withdrawal", "transfer", "payment"]),
  amount: z.string(),
  description: z.string(),
  category: z.string().optional(),
  merchantName: z.string().optional(),
  status: z.enum(["pending", "completed", "failed"]).default("completed"),
  referenceNumber: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
});

// Transfer Schema
export const transferSchema = z.object({
  _id: z.string().optional(),
  fromAccountId: z.string(),
  toAccountId: z.string().optional(),
  externalAccount: z.string().optional(),
  amount: z.string(),
  memo: z.string().optional(),
  status: z.enum(["pending", "completed", "failed"]).default("pending"),
  scheduledDate: z.date().optional(),
  isRecurring: z.boolean().default(false),
  recurringFrequency: z.enum(["weekly", "monthly", "yearly"]).optional(),
  createdAt: z.date().default(() => new Date()),
});

// Payee Schema
export const payeeSchema = z.object({
  _id: z.string().optional(),
  userId: z.string(),
  name: z.string(),
  accountNumber: z.string(),
  category: z.enum(["utilities", "credit", "insurance", "loans"]),
  isActive: z.boolean().default(true),
  createdAt: z.date().default(() => new Date()),
});

// Bill Payment Schema
export const billPaymentSchema = z.object({
  _id: z.string().optional(),
  userId: z.string(),
  payeeId: z.string(),
  accountId: z.string(),
  amount: z.string(),
  dueDate: z.date().optional(),
  status: z.enum(["pending", "completed", "failed"]).default("pending"),
  isRecurring: z.boolean().default(false),
  createdAt: z.date().default(() => new Date()),
});

// Card Schema - Full card details stored in database
export const cardSchema = z.object({
  _id: z.string().optional(),
  userId: z.string(),
  accountId: z.string(),
  cardNumber: z.string(), // Full card number
  cardType: z.enum(["debit", "credit"]),
  expiryDate: z.string(), // MM/YY format
  cvv: z.string(), // CVV code
  cardholderName: z.string(),
  isActive: z.boolean().default(true),
  dailyLimit: z.string().default("500.00"),
  monthlyLimit: z.string().default("2000.00"),
  createdAt: z.date().default(() => new Date()),
});

// Crypto Holding Schema
export const cryptoHoldingSchema = z.object({
  _id: z.string().optional(),
  userId: z.string(),
  symbol: z.string(), // BTC, ETH, etc.
  name: z.string(),
  amount: z.string(),
  averageCost: z.string(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

// Notification Schema
export const notificationSchema = z.object({
  _id: z.string().optional(),
  userId: z.string(),
  title: z.string(),
  message: z.string(),
  type: z.enum(["transaction", "security", "promotion"]),
  isRead: z.boolean().default(false),
  createdAt: z.date().default(() => new Date()),
});

// Admin Schema
export const adminSchema = z.object({
  _id: z.string().optional(),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["super_admin", "admin", "moderator"]).default("admin"),
  permissions: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  lastLogin: z.date().optional(),
  createdAt: z.date().default(() => new Date()),
});

// Insert Schemas (without _id and timestamps)
export const insertUserSchema = userSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAccountSchema = accountSchema.omit({
  _id: true,
  createdAt: true,
});

export const insertTransactionSchema = transactionSchema.omit({
  _id: true,
  createdAt: true,
});

export const insertTransferSchema = transferSchema.omit({
  _id: true,
  createdAt: true,
});

export const insertPayeeSchema = payeeSchema.omit({
  _id: true,
  createdAt: true,
});

export const insertBillPaymentSchema = billPaymentSchema.omit({
  _id: true,
  createdAt: true,
});

export const insertCardSchema = cardSchema.omit({
  _id: true,
  createdAt: true,
});

export const insertCryptoHoldingSchema = cryptoHoldingSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationSchema = notificationSchema.omit({
  _id: true,
  createdAt: true,
});

export const insertAdminSchema = adminSchema.omit({
  _id: true,
  createdAt: true,
  lastLogin: true,
});

// Types
export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Account = z.infer<typeof accountSchema>;
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type Transaction = z.infer<typeof transactionSchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transfer = z.infer<typeof transferSchema>;
export type InsertTransfer = z.infer<typeof insertTransferSchema>;
export type Payee = z.infer<typeof payeeSchema>;
export type InsertPayee = z.infer<typeof insertPayeeSchema>;
export type BillPayment = z.infer<typeof billPaymentSchema>;
export type InsertBillPayment = z.infer<typeof insertBillPaymentSchema>;
export type Card = z.infer<typeof cardSchema>;
export type InsertCard = z.infer<typeof insertCardSchema>;
export type CryptoHolding = z.infer<typeof cryptoHoldingSchema>;
export type InsertCryptoHolding = z.infer<typeof insertCryptoHoldingSchema>;
export type Notification = z.infer<typeof notificationSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Admin = z.infer<typeof adminSchema>;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;
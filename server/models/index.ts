import mongoose from 'mongoose';

// User Model
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  isVerified: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  stripeCustomerId: { type: String },
  stripeSubscriptionId: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Account Model
const accountSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  accountNumber: { type: String, required: true, unique: true },
  accountType: { type: String, enum: ['checking', 'savings', 'credit'], required: true },
  balance: { type: String, default: '0.00' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

// Transaction Model
const transactionSchema = new mongoose.Schema({
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
  type: { type: String, enum: ['deposit', 'withdrawal', 'transfer', 'payment'], required: true },
  amount: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String },
  merchantName: { type: String },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
  referenceNumber: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// Transfer Model
const transferSchema = new mongoose.Schema({
  fromAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
  toAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
  externalAccount: { type: String },
  amount: { type: String, required: true },
  memo: { type: String },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  scheduledDate: { type: Date },
  isRecurring: { type: Boolean, default: false },
  recurringFrequency: { type: String, enum: ['weekly', 'monthly', 'yearly'] },
  createdAt: { type: Date, default: Date.now },
});

// Payee Model
const payeeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  accountNumber: { type: String, required: true },
  category: { type: String, enum: ['utilities', 'credit', 'insurance', 'loans'], required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

// Bill Payment Model
const billPaymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  payeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payee', required: true },
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
  amount: { type: String, required: true },
  dueDate: { type: Date },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  isRecurring: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Card Model - Full card details stored
const cardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
  cardNumber: { type: String, required: true }, // Full card number
  cardType: { type: String, enum: ['debit', 'credit'], required: true },
  expiryDate: { type: String, required: true }, // MM/YY format
  cvv: { type: String, required: true }, // CVV code
  cardholderName: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  dailyLimit: { type: String, default: '500.00' },
  monthlyLimit: { type: String, default: '2000.00' },
  createdAt: { type: Date, default: Date.now },
});

// Crypto Holding Model
const cryptoHoldingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  symbol: { type: String, required: true }, // BTC, ETH, etc.
  name: { type: String, required: true },
  amount: { type: String, required: true },
  averageCost: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Notification Model
const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['transaction', 'security', 'promotion'], required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Admin Model
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['super_admin', 'admin', 'moderator'], default: 'admin' },
  permissions: { type: [String], default: [] },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

// Create Models
export const User = mongoose.model('User', userSchema);
export const Account = mongoose.model('Account', accountSchema);
export const Transaction = mongoose.model('Transaction', transactionSchema);
export const Transfer = mongoose.model('Transfer', transferSchema);
export const Payee = mongoose.model('Payee', payeeSchema);
export const BillPayment = mongoose.model('BillPayment', billPaymentSchema);
export const Card = mongoose.model('Card', cardSchema);
export const CryptoHolding = mongoose.model('CryptoHolding', cryptoHoldingSchema);
export const Notification = mongoose.model('Notification', notificationSchema);
export const Admin = mongoose.model('Admin', adminSchema);
import type { Express } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcryptjs";
import Stripe from "stripe";
import { storage } from "./storage";
import { authenticateToken, generateToken, type AuthRequest } from "./middleware/auth";
import { cryptoService } from "./services/crypto";
import { emailService } from "./services/email";
import { 
  insertUserSchema, insertAccountSchema, insertTransactionSchema, insertTransferSchema,
  insertPayeeSchema, insertBillPaymentSchema, insertCardSchema, insertCryptoHoldingSchema
} from "@shared/schema";

// Initialize Stripe if secret key is provided
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16",
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });
      
      // Create default checking account
      await storage.createAccount({
        userId: user.id,
        accountNumber: `CHK${Date.now()}${Math.floor(Math.random() * 1000)}`,
        accountType: 'checking',
        balance: '0.00',
      });
      
      // Create default savings account
      await storage.createAccount({
        userId: user.id,
        accountNumber: `SAV${Date.now()}${Math.floor(Math.random() * 1000)}`,
        accountType: 'savings',
        balance: '0.00',
      });
      
      const token = generateToken(user.id);
      
      res.json({
        token,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
        },
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const token = generateToken(user.id);
      
      res.json({
        token,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
        },
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // User Routes
  app.get("/api/user/profile", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUser(req.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        isVerified: user.isVerified,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/user/profile", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { fullName, phone, address } = req.body;
      
      const updatedUser = await storage.updateUser(req.userId!, {
        fullName,
        phone,
        address,
      });
      
      res.json({
        id: updatedUser.id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        isVerified: updatedUser.isVerified,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Account Routes
  app.get("/api/accounts", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const accounts = await storage.getAccountsByUserId(req.userId!);
      res.json(accounts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Transaction Routes
  app.get("/api/transactions", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const transactions = await storage.getTransactionsByUserId(req.userId!, limit);
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Transfer Routes
  app.get("/api/transfers", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const transfers = await storage.getTransfersByUserId(req.userId!);
      res.json(transfers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/transfers", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const transferData = insertTransferSchema.parse(req.body);
      
      // Verify the from account belongs to the user
      const fromAccount = await storage.getAccount(transferData.fromAccountId);
      if (!fromAccount || fromAccount.userId !== req.userId) {
        return res.status(403).json({ message: "Invalid account" });
      }
      
      // Check sufficient balance
      const balance = parseFloat(fromAccount.balance);
      const amount = parseFloat(transferData.amount);
      
      if (balance < amount) {
        return res.status(400).json({ message: "Insufficient funds" });
      }
      
      // Create transfer
      const transfer = await storage.createTransfer(transferData);
      
      // Update account balances
      await storage.updateAccount(transferData.fromAccountId, {
        balance: (balance - amount).toFixed(2),
      });
      
      if (transferData.toAccountId) {
        const toAccount = await storage.getAccount(transferData.toAccountId);
        if (toAccount) {
          const toBalance = parseFloat(toAccount.balance);
          await storage.updateAccount(transferData.toAccountId, {
            balance: (toBalance + amount).toFixed(2),
          });
        }
      }
      
      // Create transaction records
      await storage.createTransaction({
        accountId: transferData.fromAccountId,
        type: 'transfer',
        amount: `-${amount}`,
        description: `Transfer ${transferData.externalAccount ? 'to external account' : 'to internal account'}`,
        status: 'completed',
      });
      
      // Update transfer status
      await storage.updateTransfer(transfer.id, { status: 'completed' });
      
      // Send notification email
      const user = await storage.getUser(req.userId!);
      if (user) {
        await emailService.sendTransferNotification(user.email, transfer);
      }
      
      res.json(transfer);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Payee Routes
  app.get("/api/payees", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const payees = await storage.getPayeesByUserId(req.userId!);
      res.json(payees);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/payees", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const payeeData = insertPayeeSchema.parse({
        ...req.body,
        userId: req.userId,
      });
      
      const payee = await storage.createPayee(payeeData);
      res.json(payee);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Bill Payment Routes
  app.get("/api/bill-payments", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const billPayments = await storage.getBillPaymentsByUserId(req.userId!);
      res.json(billPayments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/bill-payments", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const billPaymentData = insertBillPaymentSchema.parse({
        ...req.body,
        userId: req.userId,
      });
      
      const billPayment = await storage.createBillPayment(billPaymentData);
      res.json(billPayment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Card Routes
  app.get("/api/cards", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const cards = await storage.getCardsByUserId(req.userId!);
      res.json(cards);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/cards/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const cardId = parseInt(req.params.id);
      const { dailyLimit, monthlyLimit, isActive } = req.body;
      
      const card = await storage.updateCard(cardId, {
        dailyLimit,
        monthlyLimit,
        isActive,
      });
      
      res.json(card);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Crypto Routes
  app.get("/api/crypto/holdings", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const holdings = await storage.getCryptoHoldingsByUserId(req.userId!);
      res.json(holdings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/crypto/prices", async (req, res) => {
    try {
      const symbols = (req.query.symbols as string)?.split(',') || ['BTC', 'ETH'];
      const prices = await cryptoService.getCurrentPrices(symbols);
      res.json(prices);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/crypto/buy", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { symbol, amount, accountId } = req.body;
      
      // Verify account belongs to user
      const account = await storage.getAccount(accountId);
      if (!account || account.userId !== req.userId) {
        return res.status(403).json({ message: "Invalid account" });
      }
      
      // Get current price
      const prices = await cryptoService.getCurrentPrices([symbol]);
      const price = prices[0]?.current_price;
      
      if (!price) {
        return res.status(400).json({ message: "Unable to get current price" });
      }
      
      const totalCost = amount * price;
      const balance = parseFloat(account.balance);
      
      if (balance < totalCost) {
        return res.status(400).json({ message: "Insufficient funds" });
      }
      
      // Update account balance
      await storage.updateAccount(accountId, {
        balance: (balance - totalCost).toFixed(2),
      });
      
      // Create or update crypto holding
      const existingHolding = await storage.getCryptoHolding(req.userId!, symbol);
      
      if (existingHolding) {
        const newAmount = parseFloat(existingHolding.amount) + amount;
        const newAverageCost = (
          (parseFloat(existingHolding.amount) * parseFloat(existingHolding.averageCost) + totalCost) / newAmount
        );
        
        await storage.updateCryptoHolding(existingHolding.id, {
          amount: newAmount.toFixed(8),
          averageCost: newAverageCost.toFixed(2),
        });
      } else {
        await storage.createCryptoHolding({
          userId: req.userId!,
          symbol: symbol.toUpperCase(),
          name: prices[0].name,
          amount: amount.toFixed(8),
          averageCost: price.toFixed(2),
        });
      }
      
      // Create transaction record
      await storage.createTransaction({
        accountId,
        type: 'withdrawal',
        amount: `-${totalCost.toFixed(2)}`,
        description: `Crypto purchase: ${amount} ${symbol.toUpperCase()}`,
        status: 'completed',
      });
      
      res.json({ message: "Crypto purchase successful" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Notification Routes
  app.get("/api/notifications", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const notifications = await storage.getNotificationsByUserId(req.userId!);
      res.json(notifications);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/notifications/:id/read", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      const notification = await storage.updateNotification(notificationId, {
        isRead: true,
      });
      res.json(notification);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Stripe Payment Routes
  if (stripe) {
    app.post("/api/create-payment-intent", authenticateToken, async (req: AuthRequest, res) => {
      try {
        const { amount } = req.body;
        const paymentIntent = await stripe!.paymentIntents.create({
          amount: Math.round(amount * 100), // Convert to cents
          currency: "usd",
        });
        res.json({ clientSecret: paymentIntent.client_secret });
      } catch (error: any) {
        res.status(500).json({ message: "Error creating payment intent: " + error.message });
      }
    });
  }

  const httpServer = createServer(app);
  return httpServer;
}

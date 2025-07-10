import { Router, Request, Response, NextFunction } from "express";
import { register, login, forgotPassword } from "../controllers/auth.controllers";

const router = Router();

// ✅ Register Route
router.post("/register", (req: Request, res: Response, next: NextFunction) => {
  console.log("📩 Incoming POST /register request");
  console.log("📦 Body:", req.body);
  register(req, res);
});

// ✅ Login Route
router.post("/login", (req: Request, res: Response, next: NextFunction) => {
  console.log("📩 Incoming POST /login request");
  console.log("📦 Body:", req.body);
  login(req, res);
});

// ✅ Forgot Password Route
router.post("/forgot-password", (req: Request, res: Response, next: NextFunction) => {
  console.log("📩 Incoming POST /forgot-password request");
  console.log("📦 Body:", req.body);
  forgotPassword(req, res);
});

export default router;

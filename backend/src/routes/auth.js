import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  age: true,
  weight: true,
  height: true,
  goal: true,
  dailyCalories: true,
  dietaryPreference: true,
};

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

// POST /api/auth/register
router.post(
  "/register",
  [
    body("name").trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
    body("email").isEmail().normalizeEmail().withMessage("Enter a valid email"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { name, email, password } = req.body;
    try {
      const exists = await prisma.user.findUnique({ where: { email } });
      if (exists) {
        return res.status(409).json({ error: "Email already registered" });
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const user = await prisma.user.create({
        data: { name, email, passwordHash },
        select: USER_SELECT,
      });

      res.status(201).json({ token: signToken(user.id), user });
    } catch (err) {
      console.error("Register error:", err);
      res.status(500).json({ error: "Server error during registration" });
    }
  },
);

// POST /api/auth/login
router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail().withMessage("Enter a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { email, password } = req.body;
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const { passwordHash: _hash, createdAt: _c, updatedAt: _u, ...userPublic } = user;
      res.json({ token: signToken(user.id), user: userPublic });
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ error: "Server error during login" });
    }
  },
);

export default router;

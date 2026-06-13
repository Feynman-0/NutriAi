import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { auth } from "../middleware/authMiddleware.js";

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
  createdAt: true,
};

// GET /api/users/:id
router.get("/:id", auth, async (req, res) => {
  if (req.userId !== req.params.id) {
    return res.status(403).json({ error: "Forbidden" });
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: USER_SELECT,
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/users/:id
router.put("/:id", auth, async (req, res) => {
  if (req.userId !== req.params.id) {
    return res.status(403).json({ error: "Forbidden" });
  }
  const { name, age, weight, height, goal, dailyCalories, dietaryPreference } = req.body;
  try {
    const data = {};
    if (name !== undefined) data.name = String(name);
    if (age !== undefined) data.age = Number(age);
    if (weight !== undefined) data.weight = Number(weight);
    if (height !== undefined) data.height = Number(height);
    if (goal !== undefined) data.goal = String(goal);
    if (dailyCalories !== undefined) data.dailyCalories = Number(dailyCalories);
    if (dietaryPreference !== undefined) data.dietaryPreference = String(dietaryPreference);

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data,
      select: USER_SELECT,
    });
    res.json(user);
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;

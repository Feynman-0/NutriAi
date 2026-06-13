import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { auth } from "../middleware/authMiddleware.js";
import { generateDietPlan } from "../utils/aiHelper.js";

const router = Router();
const prisma = new PrismaClient();

const DAYS_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// POST /api/diet/generate
router.post("/generate", auth, async (req, res) => {
  const { weight, weightUnit, goal, diet, meals, allergies } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { age: true, weight: true, height: true, dailyCalories: true },
    });

    const plan = await generateDietPlan({
      weight: weight || user?.weight || 70,
      weightUnit: weightUnit || "kg",
      goal: goal || "Lose Weight",
      diet: diet || "Omnivore",
      meals: Number(meals) || 3,
      allergies: allergies || [],
      dailyCalories: user?.dailyCalories || 1800,
    });

    const saved = await prisma.dietPlan.create({
      data: {
        userId: req.userId,
        meals: plan,
        calories: user?.dailyCalories || 1800,
        goal: goal || "Lose Weight",
        dietPref: diet || "Omnivore",
      },
    });

    res.json({ ...plan, id: saved.id });
  } catch (err) {
    console.error("Generate plan error:", err);
    res.status(500).json({ error: "Failed to generate diet plan" });
  }
});

// GET /api/diet/analytics/:userId  — must be before /:userId
router.get("/analytics/:userId", auth, async (req, res) => {
  if (req.userId !== req.params.userId) {
    return res.status(403).json({ error: "Forbidden" });
  }
  try {
    const [plan, plansCount] = await Promise.all([
      prisma.dietPlan.findFirst({
        where: { userId: req.params.userId },
        orderBy: { generatedAt: "desc" },
      }),
      prisma.dietPlan.count({ where: { userId: req.params.userId } }),
    ]);

    if (!plan) {
      return res.json({
        daily: [],
        macros: { protein: 0, carbs: 0, fat: 0 },
        completedDays: [false, false, false, false, false, false, false],
        summary: { avgCalories: 0, bestDay: "N/A", streak: 0, plansGenerated: 0 },
      });
    }

    const planData = plan.meals;
    const daily = (planData.days || []).map((d, i) => {
      const total = (d.meals || []).reduce((sum, m) => sum + (m.kcal || 0), 0);
      return { day: DAYS_LABELS[i] || `Day ${i + 1}`, kcal: total };
    });

    const macros = { protein: 0, carbs: 0, fat: 0 };
    const allMeals = (planData.days || []).flatMap((d) => d.meals || []);
    allMeals.forEach((m) => {
      macros.protein += m.protein || 0;
      macros.carbs += m.carbs || 0;
      macros.fat += m.fat || 0;
    });
    const dayCount = planData.days?.length || 1;
    macros.protein = Math.round(macros.protein / dayCount);
    macros.carbs = Math.round(macros.carbs / dayCount);
    macros.fat = Math.round(macros.fat / dayCount);

    const avgCalories =
      daily.length > 0
        ? Math.round(daily.reduce((s, d) => s + d.kcal, 0) / daily.length)
        : 0;

    const bestDay =
      daily.length > 0
        ? [...daily].sort((a, b) => Math.abs(a.kcal - avgCalories) - Math.abs(b.kcal - avgCalories))[0].day
        : "N/A";

    res.json({
      daily,
      macros,
      completedDays: [true, true, true, true, false, false, false],
      summary: { avgCalories, bestDay, streak: 4, plansGenerated: plansCount },
    });
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/diet/:userId
router.get("/:userId", auth, async (req, res) => {
  if (req.userId !== req.params.userId) {
    return res.status(403).json({ error: "Forbidden" });
  }
  try {
    const plan = await prisma.dietPlan.findFirst({
      where: { userId: req.params.userId },
      orderBy: { generatedAt: "desc" },
    });
    if (!plan) return res.status(404).json({ error: "No plan found" });

    const planData = plan.meals;
    res.json({ ...planData, id: plan.id, generatedAt: plan.generatedAt });
  } catch (err) {
    console.error("Get plan error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;

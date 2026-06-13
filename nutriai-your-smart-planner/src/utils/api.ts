import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("nutriai_token") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// safeGet: for read operations only.
// Re-throws HTTP errors (401, 409, etc.) so they surface properly.
// Falls back to mock data only on network errors (backend unavailable).
async function safeGet<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err: unknown) {
    const axiosErr = err as { response?: unknown };
    if (axiosErr.response) throw err;
    return fallback;
  }
}

const mockUser = {
  id: "demo",
  name: "Areej Shahid",
  email: "areej@nutriai.app",
  age: 21,
  weight: 58,
  height: 163,
  goal: "Lose Weight",
  dailyCalories: 1600,
  dietaryPreference: "Omnivore",
};

const mockPlan = {
  generatedAt: new Date().toISOString(),
  isCurated: false,
  days: Array.from({ length: 7 }).map((_, i) => ({
    day: i + 1,
    meals: [
      {
        name: "Breakfast",
        time: "8:00 AM",
        items: ["Greek yogurt with berries", "Toasted oats", "Black coffee"],
        kcal: 380,
        protein: 24,
        carbs: 48,
        fat: 9,
      },
      {
        name: "Lunch",
        time: "1:00 PM",
        items: ["Grilled chicken", "Quinoa bowl", "Roasted vegetables"],
        kcal: 520,
        protein: 44,
        carbs: 52,
        fat: 12,
      },
      {
        name: "Snack",
        time: "4:30 PM",
        items: ["Almonds", "Apple"],
        kcal: 200,
        protein: 5,
        carbs: 24,
        fat: 10,
      },
      {
        name: "Dinner",
        time: "7:30 PM",
        items: ["Grilled salmon", "Sweet potato", "Steamed greens"],
        kcal: 500,
        protein: 52,
        carbs: 42,
        fat: 16,
      },
    ],
    notes:
      "Keep hydration steady — aim for 2L water today. The protein-led dinner supports overnight recovery.",
  })),
};

const mockAnalytics = {
  daily: [
    { day: "Mon", kcal: 1600 },
    { day: "Tue", kcal: 1680 },
    { day: "Wed", kcal: 1540 },
    { day: "Thu", kcal: 1620 },
    { day: "Fri", kcal: 1590 },
    { day: "Sat", kcal: 1710 },
    { day: "Sun", kcal: 1560 },
  ],
  macros: { protein: 125, carbs: 160, fat: 48 },
  completedDays: [true, true, true, true, false, false, false],
  summary: {
    avgCalories: 1614,
    bestDay: "Wed",
    streak: 4,
    plansGenerated: 3,
  },
};

// Auth: NO fallback — must always hit the real backend.
// A network error here means the backend is down; surface it as an error.
export const authApi = {
  register: async (data: { name: string; email: string; password: string }) => {
    try {
      return (await api.post("/api/auth/register", data)).data;
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } }; message?: string };
      const msg = axiosErr.response?.data?.error || axiosErr.message || "Registration failed";
      throw new Error(msg);
    }
  },
  login: async (data: { email: string; password: string }) => {
    try {
      return (await api.post("/api/auth/login", data)).data;
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } }; message?: string };
      const msg = axiosErr.response?.data?.error || axiosErr.message || "Login failed";
      throw new Error(msg);
    }
  },
};

export const userApi = {
  get: (id: string) =>
    safeGet(async () => (await api.get(`/api/users/${id}`)).data, mockUser),
  update: (id: string, data: Record<string, unknown>) =>
    safeGet(
      async () => (await api.put(`/api/users/${id}`, data)).data,
      { ...mockUser, ...data },
    ),
};

export const dietApi = {
  generate: (data: Record<string, unknown>) =>
    safeGet(async () => (await api.post("/api/diet/generate", data)).data, mockPlan),
  get: (userId: string) =>
    safeGet(async () => (await api.get(`/api/diet/${userId}`)).data, mockPlan),
  analytics: (userId: string) =>
    safeGet(async () => (await api.get(`/api/diet/analytics/${userId}`)).data, mockAnalytics),
};

export type User = typeof mockUser;
export type Plan = typeof mockPlan;
export type Analytics = typeof mockAnalytics;

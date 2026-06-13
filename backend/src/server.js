import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import dietRoutes from "./routes/diet.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (/^http:\/\/localhost(:\d+)?$/.test(origin)) return cb(null, true);
      if (origin === process.env.FRONTEND_URL) return cb(null, true);
      // Allow all Vercel preview deployments for this project
      if (/^https:\/\/nutri-[a-z0-9]+-feynman1\.vercel\.app$/.test(origin)) return cb(null, true);
      cb(new Error(`CORS: ${origin} not allowed`));
    },
    credentials: true,
  }),
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/diet", dietRoutes);

app.get("/health", (_req, res) => res.json({ status: "ok", app: "NutriAI" }));

app.listen(PORT, () => {
  console.log(`NutriAI backend running on http://localhost:${PORT}`);
});

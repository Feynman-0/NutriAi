import request from "supertest";
import express from "express";
import authRoutes from "../src/routes/auth.js";

// Minimal express app for testing
const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);

describe("Auth endpoints", () => {
  const testEmail = `test_${Date.now()}@nutriai.test`;

  test("POST /api/auth/register — creates a user and returns token", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: testEmail,
      password: "password123",
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user).toHaveProperty("id");
    expect(res.body.user.email).toBe(testEmail);
  });

  test("POST /api/auth/register — rejects duplicate email", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: testEmail,
      password: "password123",
    });
    expect(res.statusCode).toBe(409);
  });

  test("POST /api/auth/login — succeeds with correct credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: testEmail,
      password: "password123",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  test("POST /api/auth/login — fails with wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: testEmail,
      password: "wrongpassword",
    });
    expect(res.statusCode).toBe(401);
  });

  test("POST /api/auth/register — rejects short password", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test",
      email: "other@test.com",
      password: "123",
    });
    expect(res.statusCode).toBe(400);
  });
});

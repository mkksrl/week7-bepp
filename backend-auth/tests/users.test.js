const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const User = require("../models/userModel");

let token = null;

beforeAll(async () => {
  await User.deleteMany({});
});

describe("User Routes", () => {
  describe("POST /api/users/signup", () => {
    it("should signup a new user with valid credentials", async () => {
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        password: "R3g5T7#gh",
        phone_number: "1234567890",
        gender: "Male",
        date_of_birth: "1990-01-01",
        membership_status: "Active",
      };

      const result = await api.post("/api/users/signup").send(userData);

      expect(result.status).toBe(201);
      expect(result.body).toHaveProperty("token");
    });

    it("should return an error when trying to signup with an existing email", async () => {
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        password: "R3g5T7#gh",
        phone_number: "1234567890",
        gender: "Male",
        date_of_birth: "1990-01-01",
        membership_status: "Active",
      };

      const result = await api.post("/api/users/signup").send(userData);

      expect(result.status).toBe(400);
      expect(result.body).toHaveProperty("error", "User already exists");
    });
  });

  describe("POST /api/users/login", () => {
    it("should login a user with valid credentials", async () => {
      const userData = {
        email: "john@example.com",
        password: "R3g5T7#gh",
      };

      const result = await api.post("/api/users/login").send(userData);

      expect(result.status).toBe(200);
      expect(result.body).toHaveProperty("token");
      token = result.body.token; // Store token for authenticated tests
    });

    it("should return an error when logging in with invalid credentials", async () => {
      const userData = {
        email: "john@example.com",
        password: "wrongpassword",
      };

      const result = await api.post("/api/users/login").send(userData);

      expect(result.status).toBe(400);
      expect(result.body).toHaveProperty("error", "Invalid credentials");
    });
  });
});

afterAll(() => {
  mongoose.connection.close();
});

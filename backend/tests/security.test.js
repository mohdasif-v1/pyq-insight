const request = require("supertest");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret-key-12345";
const app = require("../src/app");

describe("API Security and Route Guards", () => {
  test("GET /api/docs serves Swagger UI documentation", async () => {
    const res = await request(app).get("/api/docs/");
    expect(res.status).toBe(200);
    expect(res.text).toContain("Swagger UI");
  });

  test("Unauthorized request to /api/review/queue returns HTTP 401", async () => {
    const res = await request(app).get("/api/review/queue");
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Token missing");
  });

  test("Student role accessing admin-only route returns HTTP 403", async () => {
    const studentToken = jwt.sign(
      { id: "student123", role: "student" },
      process.env.JWT_SECRET
    );

    const res = await request(app)
      .get("/api/review/queue")
      .set("Authorization", `Bearer ${studentToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toBe("Access denied");
  });

  test("Registration payload validation rejects missing name", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "student@kit.ac.in", password: "password123" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test("Malformed or non-PDF upload rejected by papers endpoint", async () => {
    const adminToken = jwt.sign(
      { id: "admin123", role: "admin" },
      process.env.JWT_SECRET
    );

    const res = await request(app)
      .post("/api/papers")
      .set("Authorization", `Bearer ${adminToken}`)
      .field("subjectId", "123456789012345678901234")
      .field("year", 2024)
      .field("session", "Odd")
      .field("totalMarks", 100)
      .attach("paper", Buffer.from("not a pdf file content"), "malicious.exe");

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("A PDF file is required");
  });
});

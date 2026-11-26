const request = require("supertest");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret-key-12345";
const app = require("../src/app");
const { Subject, Unit, Topic, Paper, Question } = require("../src/models");

describe("Subject & Syllabus Management API Tests", () => {
  let adminToken;
  let studentToken;

  beforeAll(() => {
    adminToken = jwt.sign({ id: "admin_test", role: "admin" }, process.env.JWT_SECRET);
    studentToken = jwt.sign({ id: "student_test", role: "student" }, process.env.JWT_SECRET);
  });

  describe("Authorization & Security Guards", () => {
    test("Non-admin (student) cannot create a subject (403)", async () => {
      const res = await request(app)
        .post("/api/subjects")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ code: "TEST101", name: "Test Subject", semester: 5 });
      expect(res.status).toBe(403);
    });

    test("Non-admin (student) cannot update a subject (403)", async () => {
      const res = await request(app)
        .patch("/api/subjects/600000000000000000000001")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ name: "Updated Name" });
      expect(res.status).toBe(403);
    });

    test("Non-admin (student) cannot delete a subject (403)", async () => {
      const res = await request(app)
        .delete("/api/subjects/600000000000000000000001")
        .set("Authorization", `Bearer ${studentToken}`);
      expect(res.status).toBe(403);
    });

    test("Non-admin (student) cannot create a unit (403)", async () => {
      const res = await request(app)
        .post("/api/subjects/600000000000000000000001/units")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ unitNo: 1, title: "Unit 1" });
      expect(res.status).toBe(403);
    });

    test("Non-admin (student) cannot create a topic (403)", async () => {
      const res = await request(app)
        .post("/api/subjects/units/600000000000000000000001/topics")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ name: "Topic 1", keywords: ["test"] });
      expect(res.status).toBe(403);
    });
  });

  describe("Validation & Error Handling", () => {
    test("Rejects malformed ObjectId for subject endpoints", async () => {
      const res = await request(app)
        .get("/api/subjects/invalid-id/units")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Invalid");
    });

    test("Rejects empty code or name on subject creation", async () => {
      const res = await request(app)
        .post("/api/subjects")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ code: "", name: "", semester: 5 });
      expect(res.status).toBe(400);
    });

    test("Rejects invalid semester range", async () => {
      const res = await request(app)
        .post("/api/subjects")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ code: "INVSEM", name: "Invalid Sem Subject", semester: 25 });
      expect(res.status).toBe(400);
    });

    test("Rejects invalid unitNo on unit creation", async () => {
      const res = await request(app)
        .post("/api/subjects/600000000000000000000001/units")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ unitNo: -1, title: "Negative Unit" });
      expect(res.status).toBe(400);
    });

    test("Rejects missing topic name on topic creation", async () => {
      const res = await request(app)
        .post("/api/subjects/units/600000000000000000000001/topics")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ name: "", keywords: ["test"] });
      expect(res.status).toBe(400);
    });
  });
});

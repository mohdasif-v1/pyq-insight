const { registerSchema, paperMetaSchema, planSchema } = require("../src/validators");

describe("registerSchema", () => {
  test("accepts a valid student", () => {
    const r = registerSchema.safeParse({ name: "Asha", email: "asha@kit.ac.in", password: "secret123" });
    expect(r.success).toBe(true);
  });
  test("rejects a short password", () => {
    const r = registerSchema.safeParse({ name: "Asha", email: "asha@kit.ac.in", password: "abc" });
    expect(r.success).toBe(false);
  });
  test("rejects an invalid email", () => {
    const r = registerSchema.safeParse({ name: "Asha", email: "invalid-email", password: "secret123" });
    expect(r.success).toBe(false);
  });
});

describe("paperMetaSchema", () => {
  test("rejects an unknown session", () => {
    const r = paperMetaSchema.safeParse({
      subjectId: "a".repeat(24), year: 2024, session: "Winter", totalMarks: 70 });
    expect(r.success).toBe(false);
  });
  test("accepts valid paper metadata", () => {
    const r = paperMetaSchema.safeParse({
      subjectId: "123456789012345678901234", year: 2024, session: "Odd", totalMarks: 100 });
    expect(r.success).toBe(true);
  });
});

describe("planSchema", () => {
  test("accepts a valid plan request with future date", () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);
    const r = planSchema.safeParse({
      subjectId: "123456789012345678901234",
      examDate: futureDate.toISOString(),
      dailyHours: 4,
    });
    expect(r.success).toBe(true);
  });

  test("rejects past exam date", () => {
    const pastDate = new Date("2020-01-01");
    const r = planSchema.safeParse({
      subjectId: "123456789012345678901234",
      examDate: pastDate.toISOString(),
      dailyHours: 4,
    });
    expect(r.success).toBe(false);
  });
});

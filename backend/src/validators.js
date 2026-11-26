const { z } = require("zod");

const registerSchema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email(),
  password: z.string().min(8).max(64),
});
const loginSchema = registerSchema.pick({ email: true, password: true });

const paperMetaSchema = z.object({
  subjectId: z.string().length(24),
  year: z.coerce.number().int().min(2010).max(2100),
  session: z.enum(["Odd", "Even"]),
  totalMarks: z.coerce.number().int().positive(),
});

const planSchema = z.object({
  subjectId: z.string().length(24),
  examDate: z.coerce.date().refine((d) => d > new Date(), "Exam date must be in the future"),
  dailyHours: z.coerce.number().min(1).max(14),
});

module.exports = { registerSchema, loginSchema, paperMetaSchema, planSchema };

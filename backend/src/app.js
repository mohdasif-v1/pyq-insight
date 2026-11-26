const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const { ZodError } = require("zod");
const spec = require("./swagger");

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/subjects", require("./routes/subjects"));
app.use("/api/papers", require("./routes/papers"));
app.use("/api/practice", require("./routes/practice"));
app.use("/api/review", require("./routes/review"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/plan", require("./routes/plan"));
app.use("/api/progress", require("./routes/progress"));
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(spec));

app.use((err, req, res, next) => {
  if (err instanceof ZodError) return res.status(400).json({ error: err.issues[0].message });
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

module.exports = app;

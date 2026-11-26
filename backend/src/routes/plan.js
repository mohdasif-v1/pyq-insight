const axios = require("axios");
const router = require("express").Router();
const { authenticate } = require("../middleware/auth");
const { getScores } = require("../services/scores");
const { StudyPlan, Progress } = require("../models");
const { planSchema } = require("../validators");

router.post("/", authenticate, async (req, res, next) => {
  try {
    const { subjectId, examDate, dailyHours } = planSchema.parse(req.body);
    const daysLeft = Math.ceil((examDate - Date.now()) / 86400000);
    const scores = await getScores(subjectId);
    const weak = await Progress.find({ userId: req.user.id, status: "weak" }).distinct("topicId");

    const { data } = await axios.post(`${process.env.NLP_URL}/plan`, {
      scores: Object.fromEntries(Object.entries(scores).map(([id, s]) => [id, s.score])),
      weak: weak.map(String), days_left: daysLeft, daily_hours: dailyHours,
    });
    const plan = await StudyPlan.create({
      userId: req.user.id, subjectId, examDate, dailyHours, schedule: data.schedule,
    });
    res.status(201).json(plan);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

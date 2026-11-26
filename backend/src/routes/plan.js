const axios = require("axios");
const router = require("express").Router();
const { authenticate } = require("../middleware/auth");
const { getScores } = require("../services/scores");
const { StudyPlan, Progress, Topic, Unit } = require("../models");
const { planSchema } = require("../validators");

router.post("/", authenticate, async (req, res, next) => {
  try {
    const { subjectId, examDate, dailyHours } = planSchema.parse(req.body);
    const targetDate = new Date(examDate);
    const daysLeft = Math.ceil((targetDate - Date.now()) / 86400000);
    const scores = await getScores(subjectId);
    const weak = await Progress.find({ userId: req.user.id, status: "weak" }).distinct("topicId");

    const { data } = await axios.post(`${process.env.NLP_URL}/plan`, {
      scores: Object.fromEntries(Object.entries(scores).map(([id, s]) => [id, s.score])),
      weak: weak.map(String),
      days_left: daysLeft,
      daily_hours: dailyHours,
    });

    // Resolve Topic and Unit details to enrich schedule entries
    const topicIds = data.schedule
      .map((item) => item.topic_id || item.topicId || item.topic)
      .filter((id) => id && id !== "REVISION");

    const topics = await Topic.find({ _id: { $in: topicIds } }).lean();
    const topicMap = Object.fromEntries(topics.map((t) => [String(t._id), t]));

    const unitIds = [...new Set(topics.map((t) => t.unitId).filter(Boolean))];
    const units = await Unit.find({ _id: { $in: unitIds } }).lean();
    const unitMap = Object.fromEntries(units.map((u) => [String(u._id), u]));

    const now = new Date();
    const enrichedSchedule = (data.schedule || []).map((item) => {
      const rawTopicId = String(item.topic_id || item.topicId || item.topic || "");
      const isRevision = rawTopicId.toUpperCase() === "REVISION";

      // Calculate calendar date for this schedule day (Day 1 = today/tomorrow)
      const sessionDate = new Date(now.getTime() + (item.day - 1) * 86400000);
      const dateStr = sessionDate.toISOString().split("T")[0];

      if (isRevision) {
        return {
          day: item.day,
          date: dateStr,
          topic_id: "REVISION",
          topicId: "REVISION",
          topic: "Final Revision & Buffer",
          topicName: "Final Revision & Buffer",
          unit: "All Units",
          hours: item.hours,
          phase: "REVISION BUFFER",
        };
      }

      const tDoc = topicMap[rawTopicId];
      const uDoc = tDoc ? unitMap[String(tDoc.unitId)] : null;
      const topicName = tDoc ? tDoc.name : (rawTopicId || "Topic not assigned");
      const unitLabel = uDoc ? `Unit ${uDoc.unitNo}: ${uDoc.title}` : (uDoc ? `Unit ${uDoc.unitNo}` : "");

      return {
        day: item.day,
        date: dateStr,
        topic_id: rawTopicId,
        topicId: rawTopicId,
        topic: topicName,
        topicName: topicName,
        unit: unitLabel,
        unitNo: uDoc ? uDoc.unitNo : null,
        hours: item.hours,
        phase: "CORE TOPIC",
      };
    });

    const plan = await StudyPlan.create({
      userId: req.user.id,
      subjectId,
      examDate: targetDate,
      dailyHours,
      schedule: enrichedSchedule,
    });

    res.status(201).json(plan);
  } catch (err) {
    next(err);
  }
});

// GET /api/plan/latest?subjectId=...
router.get("/latest", authenticate, async (req, res, next) => {
  try {
    const query = { userId: req.user.id };
    if (req.query.subjectId) query.subjectId = req.query.subjectId;
    const plan = await StudyPlan.findOne(query).sort({ createdAt: -1, _id: -1 });
    if (!plan) return res.status(404).json({ error: "No study plan found" });
    res.json(plan);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

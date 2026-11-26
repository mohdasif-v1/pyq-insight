const axios = require("axios");
const cache = require("./cache");
const { Paper, Question, Topic, Unit } = require("../models");

async function getScores(subjectId) {
  const key = `scores:${subjectId}`;
  const cached = await cache.get(key);
  if (cached) return cached;

  const papers = await Paper.find({ subjectId }).lean();
  const yearOf = Object.fromEntries(papers.map((p) => [String(p._id), p.year]));
  const questions = await Question.find({
    paperId: { $in: papers.map((p) => p._id) }, topicId: { $ne: null },
  }).lean();

  const { data } = await axios.post(`${process.env.NLP_URL}/score`, {
    questions: questions.map((q) => ({
      topic_id: String(q.topicId), marks: q.marks, year: yearOf[String(q.paperId)],
    })),
    current_year: new Date().getFullYear(),
  });

  // Enrich response with topic name and unit information
  const topicIds = Object.keys(data);
  const topics = await Topic.find({ _id: { $in: topicIds } }).lean();
  const unitIds = [...new Set(topics.map((t) => t.unitId))];
  const units = await Unit.find({ _id: { $in: unitIds } }).lean();
  const unitMap = Object.fromEntries(units.map((u) => [String(u._id), u]));
  const topicMap = Object.fromEntries(topics.map((t) => [String(t._id), t]));

  for (const [tid, s] of Object.entries(data)) {
    const t = topicMap[tid];
    const u = t ? unitMap[String(t.unitId)] : null;
    s.id = tid;
    s.name = t ? t.name : "Topic " + tid;
    s.unitNo = u ? u.unitNo : null;
    s.unit = u ? `Unit ${u.unitNo}: ${u.title}` : "General";
    s.unitTitle = u ? u.title : "General";
  }

  await cache.set(key, data);
  return data;
}

module.exports = { getScores };

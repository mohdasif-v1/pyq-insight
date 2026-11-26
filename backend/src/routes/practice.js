const router = require("express").Router();
const { authenticate } = require("../middleware/auth");
const { Paper, Question, Topic } = require("../models");

// GET /api/practice/:subjectId - repeated-question clusters (clusterId >= 0, count >= 2)
router.get("/:subjectId", authenticate, async (req, res, next) => {
  try {
    const papers = await Paper.find({ subjectId: req.params.subjectId }).lean();
    const paperMap = Object.fromEntries(papers.map((p) => [String(p._id), p]));
    const paperIds = papers.map((p) => p._id);

    const questions = await Question.find({
      paperId: { $in: paperIds },
      clusterId: { $ne: null, $gte: 0 },
    }).populate("topicId", "name").lean();

    const clusterGroups = {};
    for (const q of questions) {
      const cid = q.clusterId;
      if (!clusterGroups[cid]) clusterGroups[cid] = [];
      const p = paperMap[String(q.paperId)];
      clusterGroups[cid].push({
        _id: q._id,
        id: String(q._id),
        text: q.text,
        marks: q.marks,
        clusterId: q.clusterId,
        topicId: q.topicId ? q.topicId._id : null,
        topicName: q.topicId ? q.topicId.name : "Unmapped",
        year: p ? p.year : null,
        session: p ? p.session : null,
      });
    }

    // Filter only clusters with 2 or more questions
    const repeated = Object.entries(clusterGroups)
      .filter(([_, list]) => list.length >= 2)
      .map(([cid, questionsList]) => ({
        clusterId: Number(cid),
        count: questionsList.length,
        topicName: questionsList[0].topicName,
        questions: questionsList,
      }))
      .sort((a, b) => b.count - a.count);

    res.json(repeated);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

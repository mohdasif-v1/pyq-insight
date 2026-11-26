const router = require("express").Router();
const { authenticate } = require("../middleware/auth");
const { getScores } = require("../services/scores");
const { Paper, Question } = require("../models");

router.get("/:subjectId/scores", authenticate, async (req, res, next) => {
  try {
    res.json(await getScores(req.params.subjectId));
  } catch (err) {
    next(err);
  }
});

// Year-wise question count for the trend chart
router.get("/:subjectId/trend", authenticate, async (req, res, next) => {
  try {
    const papers = await Paper.find({ subjectId: req.params.subjectId }).sort("year").lean();
    const trend = await Promise.all(papers.map(async (p) => ({
      year: p.year, questions: await Question.countDocuments({ paperId: p._id }),
    })));
    res.json(trend);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

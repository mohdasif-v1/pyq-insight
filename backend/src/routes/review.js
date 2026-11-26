const router = require("express").Router();
const { authenticate, requireRole } = require("../middleware/auth");
const { Question } = require("../models");

router.use(authenticate, requireRole("admin"));

// Low-confidence questions waiting for a human decision
router.get("/queue", async (req, res) => {
  const items = await Question.find({ needsReview: true }).sort({ confidence: 1 }).limit(50).lean();
  res.json(items);
});

router.patch("/:id", async (req, res, next) => {
  try {
    const q = await Question.findByIdAndUpdate(
      req.params.id, { topicId: req.body.topicId, needsReview: false }, { new: true });
    res.json(q);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

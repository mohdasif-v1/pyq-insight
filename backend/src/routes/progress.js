const router = require("express").Router();
const { authenticate } = require("../middleware/auth");
const { Progress } = require("../models");

router.put("/:topicId", authenticate, async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["done", "weak", "pending"].includes(status))
      return res.status(400).json({ error: "Invalid status" });
    const doc = await Progress.findOneAndUpdate(
      { userId: req.user.id, topicId: req.params.topicId },
      { status }, { upsert: true, new: true });
    res.json(doc);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

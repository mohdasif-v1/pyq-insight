const router = require("express").Router();
const { authenticate, requireRole } = require("../middleware/auth");
const { Subject, Unit, Topic } = require("../models");

// GET /api/subjects - list all subjects
router.get("/", authenticate, async (req, res, next) => {
  try {
    const subjects = await Subject.find().sort({ semester: 1, name: 1 }).lean();
    res.json(subjects);
  } catch (err) {
    next(err);
  }
});

// GET /api/subjects/:id/topics - topics with unit title and unitNo
router.get("/:id/topics", authenticate, async (req, res, next) => {
  try {
    const units = await Unit.find({ subjectId: req.params.id }).sort({ unitNo: 1 }).lean();
    const unitMap = Object.fromEntries(units.map((u) => [String(u._id), u]));
    const unitIds = units.map((u) => u._id);

    const topics = await Topic.find({ unitId: { $in: unitIds } }).lean();
    const enriched = topics.map((t) => {
      const u = unitMap[String(t.unitId)];
      return {
        id: String(t._id),
        _id: t._id,
        name: t.name,
        keywords: t.keywords,
        unitId: t.unitId,
        unitNo: u ? u.unitNo : null,
        unit: u ? `Unit ${u.unitNo}: ${u.title}` : "General",
        unitTitle: u ? u.title : "General",
      };
    });

    res.json(enriched);
  } catch (err) {
    next(err);
  }
});

// Admin syllabus management: POST /api/subjects
router.post("/", authenticate, requireRole("admin"), async (req, res, next) => {
  try {
    const { code, name, semester } = req.body;
    if (!code || !name) return res.status(400).json({ error: "Code and name are required" });
    const sub = await Subject.create({ code, name, semester: semester || 5 });
    res.status(201).json(sub);
  } catch (err) {
    next(err);
  }
});

// Admin syllabus management: POST /api/subjects/:id/units
router.post("/:id/units", authenticate, requireRole("admin"), async (req, res, next) => {
  try {
    const { unitNo, title } = req.body;
    if (!unitNo || !title) return res.status(400).json({ error: "unitNo and title are required" });
    const unit = await Unit.create({ subjectId: req.params.id, unitNo, title });
    res.status(201).json(unit);
  } catch (err) {
    next(err);
  }
});

// Admin syllabus management: POST /api/subjects/units/:unitId/topics
router.post("/units/:unitId/topics", authenticate, requireRole("admin"), async (req, res, next) => {
  try {
    const { name, keywords } = req.body;
    if (!name) return res.status(400).json({ error: "Topic name is required" });
    const topic = await Topic.create({ unitId: req.params.unitId, name, keywords: keywords || [] });
    res.status(201).json(topic);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

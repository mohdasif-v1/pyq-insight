const router = require("express").Router();
const mongoose = require("mongoose");
const { authenticate, requireRole } = require("../middleware/auth");
const { Subject, Unit, Topic, Paper, Question } = require("../models");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// GET /api/subjects - list all subjects with unit and topic counts
router.get("/", authenticate, async (req, res, next) => {
  try {
    const subjects = await Subject.find().sort({ semester: 1, name: 1 }).lean();
    const subjectIds = subjects.map((s) => s._id);

    // Fetch units for these subjects
    const units = await Unit.find({ subjectId: { $in: subjectIds } }).select("_id subjectId").lean();
    const unitIds = units.map((u) => u._id);

    // Fetch topics for these units
    const topics = await Topic.find({ unitId: { $in: unitIds } }).select("_id unitId").lean();

    // Map units to subject
    const unitCountBySub = {};
    const unitToSubMap = {};
    for (const u of units) {
      const sId = String(u.subjectId);
      unitCountBySub[sId] = (unitCountBySub[sId] || 0) + 1;
      unitToSubMap[String(u._id)] = sId;
    }

    // Map topics to subject
    const topicCountBySub = {};
    for (const t of topics) {
      const sId = unitToSubMap[String(t.unitId)];
      if (sId) {
        topicCountBySub[sId] = (topicCountBySub[sId] || 0) + 1;
      }
    }

    const enriched = subjects.map((s) => {
      const sId = String(s._id);
      return {
        ...s,
        unitCount: unitCountBySub[sId] || 0,
        topicCount: topicCountBySub[sId] || 0,
      };
    });

    res.json(enriched);
  } catch (err) {
    next(err);
  }
});

// GET /api/subjects/:id/units - list units for a subject with topic counts
router.get("/:id/units", authenticate, async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ error: "Invalid subject ID" });
    const units = await Unit.find({ subjectId: req.params.id }).sort({ unitNo: 1 }).lean();
    const unitIds = units.map((u) => u._id);

    const topics = await Topic.find({ unitId: { $in: unitIds } }).select("_id unitId").lean();
    const topicCountByUnit = {};
    for (const t of topics) {
      const uId = String(t.unitId);
      topicCountByUnit[uId] = (topicCountByUnit[uId] || 0) + 1;
    }

    const enriched = units.map((u) => ({
      ...u,
      topicCount: topicCountByUnit[String(u._id)] || 0,
    }));

    res.json(enriched);
  } catch (err) {
    next(err);
  }
});

// GET /api/subjects/units/:unitId/topics - list topics for a unit
router.get("/units/:unitId/topics", authenticate, async (req, res, next) => {
  try {
    if (!isValidId(req.params.unitId)) return res.status(400).json({ error: "Invalid unit ID" });
    const topics = await Topic.find({ unitId: req.params.unitId }).sort({ name: 1 }).lean();
    res.json(topics);
  } catch (err) {
    next(err);
  }
});

// GET /api/subjects/:id/topics - topics with unit title and unitNo (kept for backward compatibility)
router.get("/:id/topics", authenticate, async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ error: "Invalid subject ID" });
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
        keywords: t.keywords || [],
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

// ==========================================
// ADMIN SUBJECT CRUD
// ==========================================

// POST /api/subjects - create subject
router.post("/", authenticate, requireRole("admin"), async (req, res, next) => {
  try {
    const { code, name, semester } = req.body;
    if (!code || !name) return res.status(400).json({ error: "Code and name are required" });

    const trimmedCode = String(code).trim().toUpperCase();
    const trimmedName = String(name).trim();
    const sem = parseInt(semester, 10);
    if (!sem || sem < 1 || sem > 12) {
      return res.status(400).json({ error: "Semester must be a positive integer between 1 and 12" });
    }

    const existing = await Subject.findOne({ code: { $regex: new RegExp(`^${trimmedCode}$`, "i") } });
    if (existing) {
      return res.status(409).json({ error: `Subject code '${trimmedCode}' already exists` });
    }

    const sub = await Subject.create({ code: trimmedCode, name: trimmedName, semester: sem });
    res.status(201).json(sub);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/subjects/:id - update subject
router.patch("/:id", authenticate, requireRole("admin"), async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ error: "Invalid subject ID" });
    const { code, name, semester } = req.body;

    const sub = await Subject.findById(req.params.id);
    if (!sub) return res.status(404).json({ error: "Subject not found" });

    if (code !== undefined) {
      const trimmedCode = String(code).trim().toUpperCase();
      if (!trimmedCode) return res.status(400).json({ error: "Subject code cannot be empty" });

      const duplicate = await Subject.findOne({
        _id: { $ne: sub._id },
        code: { $regex: new RegExp(`^${trimmedCode}$`, "i") },
      });
      if (duplicate) {
        return res.status(409).json({ error: `Subject code '${trimmedCode}' is already in use by another subject` });
      }
      sub.code = trimmedCode;
    }

    if (name !== undefined) {
      const trimmedName = String(name).trim();
      if (!trimmedName) return res.status(400).json({ error: "Subject name cannot be empty" });
      sub.name = trimmedName;
    }

    if (semester !== undefined) {
      const sem = parseInt(semester, 10);
      if (!sem || sem < 1 || sem > 12) {
        return res.status(400).json({ error: "Semester must be a positive integer between 1 and 12" });
      }
      sub.semester = sem;
    }

    await sub.save();
    res.json(sub);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/subjects/:id - delete subject with strict referential integrity
router.delete("/:id", authenticate, requireRole("admin"), async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ error: "Invalid subject ID" });
    const sub = await Subject.findById(req.params.id);
    if (!sub) return res.status(404).json({ error: "Subject not found" });

    // Check papers
    const papersCount = await Paper.countDocuments({ subjectId: sub._id });
    if (papersCount > 0) {
      return res.status(409).json({
        error: `Cannot delete subject '${sub.name}': ${papersCount} question paper(s) are associated with it. Delete or reassign papers first to preserve academic history.`,
      });
    }

    // Check units
    const units = await Unit.find({ subjectId: sub._id }).lean();
    if (units.length > 0) {
      const unitIds = units.map((u) => u._id);
      const topicsCount = await Topic.countDocuments({ unitId: { $in: unitIds } });
      return res.status(409).json({
        error: `Cannot delete subject '${sub.name}': contains ${units.length} unit(s) and ${topicsCount} topic(s). Remove all units and topics first.`,
      });
    }

    await Subject.findByIdAndDelete(sub._id);
    res.json({ message: "Subject deleted successfully", id: sub._id });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// ADMIN UNIT CRUD
// ==========================================

// POST /api/subjects/:id/units - create unit
router.post("/:id/units", authenticate, requireRole("admin"), async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ error: "Invalid subject ID" });

    const { unitNo, title } = req.body;
    const num = parseInt(unitNo, 10);
    if (!num || num < 1) return res.status(400).json({ error: "unitNo must be a positive integer" });
    if (!title || !String(title).trim()) return res.status(400).json({ error: "Unit title is required" });

    const sub = await Subject.findById(req.params.id);
    if (!sub) return res.status(404).json({ error: "Subject not found" });

    const trimmedTitle = String(title).trim();

    // Check duplicate unitNo in same subject
    const existingUnit = await Unit.findOne({ subjectId: sub._id, unitNo: num });
    if (existingUnit) {
      return res.status(409).json({ error: `Unit ${num} already exists in subject '${sub.name}'` });
    }

    const unit = await Unit.create({ subjectId: sub._id, unitNo: num, title: trimmedTitle });
    res.status(201).json(unit);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/subjects/units/:unitId - update unit
router.patch("/units/:unitId", authenticate, requireRole("admin"), async (req, res, next) => {
  try {
    if (!isValidId(req.params.unitId)) return res.status(400).json({ error: "Invalid unit ID" });
    const unit = await Unit.findById(req.params.unitId);
    if (!unit) return res.status(404).json({ error: "Unit not found" });

    const { unitNo, title } = req.body;

    if (unitNo !== undefined) {
      const num = parseInt(unitNo, 10);
      if (!num || num < 1) return res.status(400).json({ error: "unitNo must be a positive integer" });

      const duplicate = await Unit.findOne({
        _id: { $ne: unit._id },
        subjectId: unit.subjectId,
        unitNo: num,
      });
      if (duplicate) {
        return res.status(409).json({ error: `Unit ${num} already exists in this subject` });
      }
      unit.unitNo = num;
    }

    if (title !== undefined) {
      const trimmedTitle = String(title).trim();
      if (!trimmedTitle) return res.status(400).json({ error: "Unit title cannot be empty" });
      unit.title = trimmedTitle;
    }

    await unit.save();
    res.json(unit);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/subjects/units/:unitId - delete unit with referential integrity
router.delete("/units/:unitId", authenticate, requireRole("admin"), async (req, res, next) => {
  try {
    if (!isValidId(req.params.unitId)) return res.status(400).json({ error: "Invalid unit ID" });
    const unit = await Unit.findById(req.params.unitId);
    if (!unit) return res.status(404).json({ error: "Unit not found" });

    // Check topics in this unit
    const topics = await Topic.find({ unitId: unit._id }).lean();
    if (topics.length > 0) {
      return res.status(409).json({
        error: `Cannot delete Unit ${unit.unitNo}: contains ${topics.length} topic(s). Remove all topics first.`,
      });
    }

    await Unit.findByIdAndDelete(unit._id);
    res.json({ message: "Unit deleted successfully", id: unit._id });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// ADMIN TOPIC CRUD
// ==========================================

// POST /api/subjects/units/:unitId/topics - create topic
router.post("/units/:unitId/topics", authenticate, requireRole("admin"), async (req, res, next) => {
  try {
    if (!isValidId(req.params.unitId)) return res.status(400).json({ error: "Invalid unit ID" });

    const { name, keywords } = req.body;
    if (!name || !String(name).trim()) return res.status(400).json({ error: "Topic name is required" });
    const trimmedName = String(name).trim();

    const unit = await Unit.findById(req.params.unitId);
    if (!unit) return res.status(404).json({ error: "Unit not found" });

    // Prevent duplicate topic name within same unit
    const existing = await Topic.findOne({
      unitId: unit._id,
      name: { $regex: new RegExp(`^${trimmedName}$`, "i") },
    });
    if (existing) {
      return res.status(409).json({ error: `Topic '${trimmedName}' already exists in Unit ${unit.unitNo}` });
    }

    // Process keywords: normalize, trim, remove empty
    let kwList = [];
    if (Array.isArray(keywords)) {
      kwList = keywords.map((k) => String(k).trim()).filter(Boolean);
    } else if (typeof keywords === "string") {
      kwList = keywords.split(",").map((k) => k.trim()).filter(Boolean);
    }

    const topic = await Topic.create({ unitId: unit._id, name: trimmedName, keywords: kwList });
    res.status(201).json(topic);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/subjects/topics/:topicId - update topic
router.patch("/topics/:topicId", authenticate, requireRole("admin"), async (req, res, next) => {
  try {
    if (!isValidId(req.params.topicId)) return res.status(400).json({ error: "Invalid topic ID" });
    const topic = await Topic.findById(req.params.topicId);
    if (!topic) return res.status(404).json({ error: "Topic not found" });

    const { name, keywords } = req.body;

    if (name !== undefined) {
      const trimmedName = String(name).trim();
      if (!trimmedName) return res.status(400).json({ error: "Topic name cannot be empty" });

      const duplicate = await Topic.findOne({
        _id: { $ne: topic._id },
        unitId: topic.unitId,
        name: { $regex: new RegExp(`^${trimmedName}$`, "i") },
      });
      if (duplicate) {
        return res.status(409).json({ error: `Topic '${trimmedName}' already exists in this unit` });
      }
      topic.name = trimmedName;
    }

    if (keywords !== undefined) {
      let kwList = [];
      if (Array.isArray(keywords)) {
        kwList = keywords.map((k) => String(k).trim()).filter(Boolean);
      } else if (typeof keywords === "string") {
        kwList = keywords.split(",").map((k) => k.trim()).filter(Boolean);
      }
      topic.keywords = kwList;
    }

    await topic.save();
    res.json(topic);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/subjects/topics/:topicId - delete topic with referential integrity
router.delete("/topics/:topicId", authenticate, requireRole("admin"), async (req, res, next) => {
  try {
    if (!isValidId(req.params.topicId)) return res.status(400).json({ error: "Invalid topic ID" });
    const topic = await Topic.findById(req.params.topicId);
    if (!topic) return res.status(404).json({ error: "Topic not found" });

    // Check questions mapped to this topic
    const questionsCount = await Question.countDocuments({ topicId: topic._id });
    if (questionsCount > 0) {
      return res.status(409).json({
        error: `Cannot delete topic '${topic.name}': ${questionsCount} question(s) are mapped to it in existing papers. Reassign those questions in Review Queue before deleting.`,
      });
    }

    await Topic.findByIdAndDelete(topic._id);
    res.json({ message: "Topic deleted successfully", id: topic._id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

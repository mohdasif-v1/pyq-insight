const fs = require("fs");
const axios = require("axios");
const multer = require("multer");
const router = require("express").Router();
const { authenticate, requireRole } = require("../middleware/auth");
const { Paper, Question, Topic, Unit } = require("../models");
const { paperMetaSchema } = require("../validators");

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(null, file.mimetype === "application/pdf"),
});

router.post("/", authenticate, requireRole("admin"), upload.single("paper"), async (req, res, next) => {
  try {
    const meta = paperMetaSchema.parse(req.body);
    if (!req.file) return res.status(400).json({ error: "A PDF file is required" });

    const unitIds = await Unit.find({ subjectId: meta.subjectId }).distinct("_id");
    const topics = await Topic.find({ unitId: { $in: unitIds } }).lean();

    const form = new FormData();
    form.append("file", new Blob([fs.readFileSync(req.file.path)]), req.file.originalname);
    form.append("topics", JSON.stringify(topics.map((t) => ({ id: String(t._id), name: t.name, keywords: t.keywords }))));
    const { data } = await axios.post(`${process.env.NLP_URL}/process`, form);

    const paper = await Paper.create({ ...meta, fileUrl: req.file.path });
    await Question.insertMany(data.questions.map((q) => ({
      paperId: paper._id, text: q.text, marks: q.marks, topicId: q.topic_id,
      confidence: q.confidence, clusterId: q.cluster_id, needsReview: q.needs_review,
    })));
    res.status(201).json({ paperId: paper._id, questions: data.questions.length });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

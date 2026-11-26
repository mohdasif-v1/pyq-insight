const { Schema, model } = require("mongoose");

const ref = (name) => ({ type: Schema.Types.ObjectId, ref: name });

const User = model("User", new Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true },
  passwordHash: String,
  role: { type: String, enum: ["student", "admin"], default: "student" },
}));
const Subject = model("Subject", new Schema({ code: String, name: String, semester: Number }));
const Unit = model("Unit", new Schema({ subjectId: ref("Subject"), unitNo: Number, title: String }));
const Topic = model("Topic", new Schema({ unitId: ref("Unit"), name: String, keywords: [String] }));
const Paper = model("Paper", new Schema({
  subjectId: ref("Subject"), year: Number, session: String, totalMarks: Number, fileUrl: String,
}));
const Question = model("Question", new Schema({
  paperId: ref("Paper"), text: String, marks: Number, topicId: ref("Topic"),
  confidence: Number, clusterId: Number, needsReview: { type: Boolean, default: false },
}));
const StudyPlan = model("StudyPlan", new Schema({
  userId: ref("User"), subjectId: ref("Subject"), examDate: Date, dailyHours: Number, schedule: [Object],
}));
const Progress = model("Progress", new Schema({
  userId: ref("User"), topicId: ref("Topic"),
  status: { type: String, enum: ["done", "weak", "pending"], default: "pending" },
}));
const TopicScore = model("TopicScore", new Schema({
  topicId: ref("Topic"), frequency: Number, recency: Number, marksWeight: Number, finalScore: Number,
}));

module.exports = { User, Subject, Unit, Topic, Paper, Question, StudyPlan, Progress, TopicScore };

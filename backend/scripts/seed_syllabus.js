const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const { Subject, Unit, Topic } = require("../src/models");

const UNIT_TITLES_DBMS = {
  1: "Introduction and ER Model",
  2: "Relational Data Model and SQL",
  3: "Normalization",
  4: "Transactions and Recovery",
  5: "Concurrency Control",
};

const UNIT_TITLES_DA = {
  1: "Introduction to Data Analytics",
  2: "Analysis and Modelling Techniques",
  3: "Mining Data Streams",
  4: "Frequent Itemsets and Clustering",
  5: "Frameworks and Visualization",
};

async function seedRealSyllabus() {
  if (!process.env.MONGO_URL) {
    console.error("MONGO_URL not defined in environment");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URL);
  console.log("Connected to MongoDB for real syllabus seed");

  const dbmsJsonPath = path.join(__dirname, "../../nlp/evaluation/data/syllabus_dbms.json");
  const daJsonPath = path.join(__dirname, "../../nlp/evaluation/data/syllabus_da.json");

  const dbmsTopics = JSON.parse(fs.readFileSync(dbmsJsonPath, "utf-8"));
  const daTopics = JSON.parse(fs.readFileSync(daJsonPath, "utf-8"));

  // 1. Database Management System
  let dbmsSub = await Subject.findOne({ name: "Database Management System" });
  if (!dbmsSub) {
    dbmsSub = await Subject.create({ code: "KCS501", name: "Database Management System", semester: 5 });
  }

  for (let uNo = 1; uNo <= 5; uNo++) {
    let uDoc = await Unit.findOne({ subjectId: dbmsSub._id, unitNo: uNo });
    if (!uDoc) {
      uDoc = await Unit.create({ subjectId: dbmsSub._id, unitNo: uNo, title: UNIT_TITLES_DBMS[uNo] });
    }
    const unitTopics = dbmsTopics.filter((t) => t.unit === uNo);
    for (const t of unitTopics) {
      let topDoc = await Topic.findOne({ unitId: uDoc._id, name: t.topic });
      if (!topDoc) {
        await Topic.create({ unitId: uDoc._id, name: t.topic, keywords: t.keywords });
      }
    }
  }
  console.log("DBMS syllabus seeded successfully");

  // 2. Data Analytics
  let daSub = await Subject.findOne({ name: "Data Analytics" });
  if (!daSub) {
    daSub = await Subject.create({ code: "KCS051", name: "Data Analytics", semester: 5 });
  }

  for (let uNo = 1; uNo <= 5; uNo++) {
    let uDoc = await Unit.findOne({ subjectId: daSub._id, unitNo: uNo });
    if (!uDoc) {
      uDoc = await Unit.create({ subjectId: daSub._id, unitNo: uNo, title: UNIT_TITLES_DA[uNo] });
    }
    const unitTopics = daTopics.filter((t) => t.unit === uNo);
    for (const t of unitTopics) {
      let topDoc = await Topic.findOne({ unitId: uDoc._id, name: t.topic });
      if (!topDoc) {
        await Topic.create({ unitId: uDoc._id, name: t.topic, keywords: t.keywords });
      }
    }
  }
  console.log("Data Analytics syllabus seeded successfully");

  await mongoose.disconnect();
}

seedRealSyllabus().catch((err) => {
  console.error("Error seeding syllabus:", err);
  process.exit(1);
});

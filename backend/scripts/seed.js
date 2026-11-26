const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const { Subject, Unit, Topic } = require("../src/models");

/**
 * SAMPLE SYLLABUS SEED SCRIPT
 *
 * NOTE: This is a SAMPLE syllabus structure provided to verify system functionality
 * and test subject/unit/topic queries. It should be replaced with your full official
 * AKTU syllabus when available.
 */
const SAMPLE_SYLLABUS = {
  subject: {
    code: "KCS501",
    name: "Database Management System",
    semester: 5,
  },
  units: [
    {
      unitNo: 1,
      title: "Introduction and ER Model",
      topics: [
        {
          name: "DBMS vs File System",
          keywords: ["dbms", "file system", "data redundancy", "data isolation", "data inconsistency"],
        },
        {
          name: "Three-Schema Architecture and Data Independence",
          keywords: ["three-schema", "logical data independence", "physical data independence", "view level", "conceptual level"],
        },
        {
          name: "ER Model Concepts",
          keywords: ["entity", "attribute", "relationship", "weak entity", "generalization", "aggregation"],
        },
        {
          name: "ER Diagram to Relational Schema",
          keywords: ["er diagram", "reduction to tables", "foreign key", "primary key", "mapping"],
        },
      ],
    },
    {
      unitNo: 2,
      title: "Relational Data Model and SQL",
      topics: [
        {
          name: "Relational Algebra",
          keywords: ["select", "project", "cartesian product", "join", "division", "relational algebra"],
        },
        {
          name: "SQL Queries and Integrity Constraints",
          keywords: ["sql", "select from where", "primary key", "foreign key", "check constraint", "aggregate functions"],
        },
        {
          name: "Joins and Subqueries",
          keywords: ["inner join", "outer join", "left join", "right join", "nested query", "correlated subquery"],
        },
        {
          name: "Views and Triggers",
          keywords: ["view", "trigger", "pl/sql", "assertion", "stored procedure"],
        },
      ],
    },
    {
      unitNo: 3,
      title: "Normalization",
      topics: [
        {
          name: "Functional Dependencies and Keys",
          keywords: ["functional dependency", "armstrong axioms", "attribute closure", "candidate key", "superkey"],
        },
        {
          name: "Normal Forms (1NF, 2NF, 3NF, BCNF)",
          keywords: ["1nf", "2nf", "3nf", "bcnf", "partial dependency", "transitive dependency"],
        },
        {
          name: "Decomposition Properties",
          keywords: ["lossless join decomposition", "dependency preserving", "lossless", "decomposition"],
        },
        {
          name: "Multivalued Dependencies and 4NF/5NF",
          keywords: ["multivalued dependency", "mvd", "4nf", "fourth normal form", "5nf", "join dependency"],
        },
      ],
    },
    {
      unitNo: 4,
      title: "Transaction Processing and Recovery",
      topics: [
        {
          name: "ACID Properties and States",
          keywords: ["acid", "atomicity", "consistency", "isolation", "durability", "transaction states"],
        },
        {
          name: "Serializability and Schedules",
          keywords: ["conflict serializable", "view serializable", "precedence graph", "schedule", "swap non-conflicting"],
        },
        {
          name: "Recoverability and Cascading Rollbacks",
          keywords: ["recoverable schedule", "cascadeless schedule", "strict schedule", "cascading rollback"],
        },
        {
          name: "Log-Based Recovery and Checkpoints",
          keywords: ["log based recovery", "deferred database modification", "immediate update", "checkpoint", "redo", "undo"],
        },
      ],
    },
    {
      unitNo: 5,
      title: "Concurrency Control Techniques",
      topics: [
        {
          name: "Lock-Based Protocols (2PL)",
          keywords: ["two phase locking", "2pl", "strict 2pl", "rigorous 2pl", "shared lock", "exclusive lock"],
        },
        {
          name: "Timestamp Ordering and Validation",
          keywords: ["timestamp ordering", "thomas write rule", "validation protocol", "optimistic concurrency control"],
        },
        {
          name: "Deadlock Handling",
          keywords: ["deadlock detection", "deadlock prevention", "wait-die", "wound-wait", "resource allocation graph"],
        },
      ],
    },
  ],
};

async function seed() {
  if (!process.env.MONGO_URL) {
    console.error("MONGO_URL not defined in environment");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URL);
  console.log("Connected to MongoDB for seeding");

  let subject = await Subject.findOne({ name: SAMPLE_SYLLABUS.subject.name });
  if (!subject) {
    subject = await Subject.create(SAMPLE_SYLLABUS.subject);
    console.log(`Created subject: ${subject.name} (${subject._id})`);
  } else {
    console.log(`Found existing subject: ${subject.name} (${subject._id})`);
  }

  for (const u of SAMPLE_SYLLABUS.units) {
    let unit = await Unit.findOne({ subjectId: subject._id, unitNo: u.unitNo });
    if (!unit) {
      unit = await Unit.create({ subjectId: subject._id, unitNo: u.unitNo, title: u.title });
      console.log(`  Created Unit ${unit.unitNo}: ${unit.title}`);
    }

    for (const t of u.topics) {
      let topic = await Topic.findOne({ unitId: unit._id, name: t.name });
      if (!topic) {
        topic = await Topic.create({ unitId: unit._id, name: t.name, keywords: t.keywords });
        console.log(`    Created Topic: ${topic.name}`);
      }
    }
  }

  console.log("Seeding complete!");
  await mongoose.disconnect();
}

if (require.main === module) {
  seed().catch((err) => {
    console.error("Seed error:", err);
    process.exit(1);
  });
}

module.exports = { seed, SAMPLE_SYLLABUS };

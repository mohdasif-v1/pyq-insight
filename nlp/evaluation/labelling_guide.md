# Question Labelling Guide for AKTU Examination Evaluation

This guide outlines ground-truth labelling rules for B.Tech Sem-V question papers (`labels_dbms.csv` and `labels_da.csv`).

## 1. Ground Truth Principles
1. **Unbiased & Independent**: Labels must strictly represent the actual syllabus concept tested by the question. Model predictions or topic guesses must never be consulted during labelling.
2. **One Primary Topic per Question (`true_topic`)**:
   - Each row must have exactly one primary topic that best answers the core question.
   - The value of `true_topic` **MUST EXACTLY MATCH** one of the topic names in `nlp/evaluation/data/syllabus_dbms.json` (for DBMS) or `nlp/evaluation/data/syllabus_da.json` (for Data Analytics).
3. **Compound Questions (`also_topic`)**:
   - Use `also_topic` ONLY if the question explicitly joins two distinct syllabus topics (e.g. `(i) Multivalued dependency (ii) Trigger`).
   - Leave `also_topic` blank for single-concept questions.
4. **Out of Scope Questions (`OUT_OF_SCOPE`)**:
   - If a question asks about a topic completely absent from the syllabus specification, mark `OUT_OF_SCOPE`.

---

## 2. Permitted Topic Names

### Database Management System (`syllabus_dbms.json`)
- `DBMS vs File System`
- `Data Models, Schemas, and Independence`
- `DBMS Architecture and DBA`
- `ER Model Concepts`
- `Reducing ER Diagrams to Relational Tables`
- `Relational Algebra and Calculus`
- `SQL DDL, DML, and Aggregate Functions`
- `Joins and Integrity Constraints`
- `Views, Triggers, and PL/SQL`
- `Procedural vs Non-Procedural DML`
- `Functional Dependencies and Attribute Closure`
- `Keys and Prime Attributes`
- `Normal Forms (1NF, 2NF, 3NF, BCNF)`
- `Multivalued Dependencies, 4NF, and 5NF`
- `Lossless-Join and Dependency-Preserving Decomposition`
- `ACID Properties and Transaction States`
- `Schedules and Serializability`
- `Recoverability of Schedules`
- `Failure, Log-Based Recovery, and Checkpoints`
- `Distributed Database Basics and Replication`
- `Lock-Based Protocols and 2PL`
- `Timestamp Ordering and Validation Protocols`
- `Multiversion Concurrency Control`
- `Deadlock Detection, Prevention, and Recovery`
- `Multiple Granularity and Two-Phase Commit`

### Data Analytics (`syllabus_da.json`)
- `Data Analytics Lifecycle and Big Data Characteristics`
- `Data Types and Sources`
- `Categories of Analytics`
- `Modern Data Architecture and Analytics Tools`
- `Regression and Prediction Error`
- `Bayesian Modelling and Networks`
- `Support Vector Machines and Kernel Methods`
- `PCA and Dimensionality Reduction`
- `Neural Networks and Generalization`
- `Fuzzy Logic, Decision Trees, and Outliers`
- `Stream Model and Real-Time Analytics`
- `Sampling and Filtering Streams`
- `Counting Distinct Elements and Counting Ones`
- `Windows in Streams`
- `Frequent Itemsets and Market Basket Analysis`
- `Apriori, PCY, and SON Algorithms`
- `K-Means and Hierarchical Clustering`
- `Subspace and Non-Euclidean Clustering`
- `Hadoop, HDFS, and MapReduce`
- `Hive, Pig, and NoSQL Frameworks`
- `Exploratory Data Analysis and Descriptive Statistics`
- `Visualization and Analytics Tools (R, KNIME, OpenRefine)`

---

## 3. Validation
Before running evaluation scripts, run the validation tool:
```bash
python nlp/evaluation/validate_labels.py
```
The script confirms that every row is filled, valid topic names are used, and no duplicate questions exist.

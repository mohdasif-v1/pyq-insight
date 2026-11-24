import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

import { User } from '../apps/api/src/models/User.js';
import { Subject } from '../apps/api/src/models/Subject.js';
import { Unit } from '../apps/api/src/models/Unit.js';
import { Topic } from '../apps/api/src/models/Topic.js';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pyq_insight';

async function seed() {
  console.log('[Seed] Connecting to MongoDB at', MONGO_URI);
  await mongoose.connect(MONGO_URI);

  // 1. Seed Default Admin and Student Users
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Admin@1234', salt);
  const studentHash = await bcrypt.hash('Student@1234', salt);

  await User.findOneAndUpdate(
    { email: 'admin@aktu.ac.in' },
    {
      name: 'AKTU Faculty Administrator',
      email: 'admin@aktu.ac.in',
      passwordHash,
      role: 'ADMIN',
      isActive: true,
    },
    { upsert: true, new: true }
  );

  await User.findOneAndUpdate(
    { email: 'student@aktu.ac.in' },
    {
      name: 'Rahul Sharma',
      email: 'student@aktu.ac.in',
      passwordHash: studentHash,
      role: 'STUDENT',
      isActive: true,
    },
    { upsert: true, new: true }
  );

  console.log('[Seed] Admin and Student accounts seeded.');

  // 2. Seed AKTU B.Tech CSE Core Subject: Operating Systems (KCS-401)
  const osSubject = await Subject.findOneAndUpdate(
    { code: 'KCS401', syllabusVersion: '2022-23' },
    {
      university: 'AKTU',
      code: 'KCS401',
      name: 'Operating Systems',
      branch: 'CSE',
      semester: 4,
      syllabusVersion: '2022-23',
      isActive: true,
    },
    { upsert: true, new: true }
  );

  console.log('[Seed] Subject seeded:', osSubject.name);

  // Clear existing units and topics for clean idempotency
  const existingUnits = await Unit.find({ subjectId: osSubject._id });
  for (const u of existingUnits) {
    await Topic.deleteMany({ unitId: u._id });
  }
  await Unit.deleteMany({ subjectId: osSubject._id });

  // 3. Seed AKTU OS Syllabus Units & Topics
  const unitsData = [
    {
      unitNo: 1,
      title: 'Unit 1: Introduction and Operating System Structures',
      topics: [
        { name: 'OS Functions & Evolution', keywords: ['operating system', 'evolution', 'batch', 'multiprogramming', 'time sharing', 'real time'] },
        { name: 'System Calls & OS Structures', keywords: ['system call', 'layered architecture', 'microkernel', 'monolithic', 'dual mode'] },
      ]
    },
    {
      unitNo: 2,
      title: 'Unit 2: Processes & CPU Scheduling',
      topics: [
        { name: 'Process Management & PCB', keywords: ['pcb', 'process control block', 'process states', 'context switch', 'fork'] },
        { name: 'CPU Scheduling Algorithms', keywords: ['scheduling', 'fcfs', 'sjf', 'round robin', 'priority', 'preemptive', 'multilevel queue'] },
        { name: 'Inter-Process Communication (IPC)', keywords: ['ipc', 'shared memory', 'message passing', 'pipes', 'producer consumer'] }
      ]
    },
    {
      unitNo: 3,
      title: 'Unit 3: Process Synchronization & Deadlocks',
      topics: [
        { name: 'Critical Section & Semaphores', keywords: ['critical section', 'peterson solution', 'semaphores', 'mutex', 'readers writers', 'dining philosophers'] },
        { name: 'Deadlock Detection & Prevention', keywords: ['deadlock', 'necessary conditions', 'resource allocation graph', 'prevention', 'avoidance'] },
        { name: 'Banker\'s Algorithm', keywords: ['banker algorithm', 'safe state', 'resource allocation', 'deadlock avoidance'] }
      ]
    },
    {
      unitNo: 4,
      title: 'Unit 4: Memory Management',
      topics: [
        { name: 'Contiguous Memory & Paging', keywords: ['contiguous memory', 'fragmentation', 'paging', 'page table', 'tlb'] },
        { name: 'Virtual Memory & Page Replacement', keywords: ['virtual memory', 'demand paging', 'page fault', 'fifo', 'lru', 'optimal', 'belady anomaly'] },
      ]
    },
    {
      unitNo: 5,
      title: 'Unit 5: Storage & File Systems',
      topics: [
        { name: 'Disk Scheduling Algorithms', keywords: ['disk scheduling', 'fcfs', 'sstf', 'scan', 'c-scan', 'look', 'seek time'] },
        { name: 'File System & Directory Structures', keywords: ['file system', 'allocation methods', 'contiguous', 'linked', 'indexed', 'directory'] }
      ]
    }
  ];

  for (const uData of unitsData) {
    const unit = await Unit.create({
      subjectId: osSubject._id,
      unitNo: uData.unitNo,
      title: uData.title
    });

    for (const tData of uData.topics) {
      await Topic.create({
        unitId: unit._id,
        name: tData.name,
        keywords: tData.keywords,
        difficulty: 'MEDIUM',
        isActive: true
      });
    }
  }

  console.log('[Seed] AKTU Syllabus Units and Topics seeded successfully.');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('[Seed Error]:', err);
  process.exit(1);
});

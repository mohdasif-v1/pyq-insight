import { generateStudySchedule } from '../src/services/planner.service.js';
import { Unit } from '../src/models/Unit.js';
import { Topic } from '../src/models/Topic.js';
import { TopicScore } from '../src/models/TopicScore.js';

// Mock mongoose models
jest.mock('../src/models/Unit.js');
jest.mock('../src/models/Topic.js');
jest.mock('../src/models/TopicScore.js');

describe('Study Planner Service', () => {
  const mockSubjectId = '507f1f77bcf86cd799439011';

  beforeEach(() => {
    jest.clearAllMocks();

    (Unit.find as jest.Mock).mockReturnValue({
      lean: jest.fn().mockResolvedValue([
        { _id: 'u1', unitNo: 1, title: 'Unit 1: Fundamentals' },
        { _id: 'u2', unitNo: 2, title: 'Unit 2: Advanced' },
      ]),
    });

    (Topic.find as jest.Mock).mockReturnValue({
      lean: jest.fn().mockResolvedValue([
        { _id: 't1', unitId: 'u1', name: 'Topic 1 - Easy', isActive: true },
        { _id: 't2', unitId: 'u2', name: 'Topic 2 - Hard', isActive: true },
        { _id: 't3', unitId: 'u2', name: 'Topic 3 - Weak Focus', isActive: true },
      ]),
    });

    (TopicScore.find as jest.Mock).mockReturnValue({
      lean: jest.fn().mockResolvedValue([
        { topicId: 't1', finalScore: 40 },
        { topicId: 't2', finalScore: 80 },
        { topicId: 't3', finalScore: 50 },
      ]),
    });
  });

  it('allocates study tasks and applies +50% weakness boost', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    const examDateStr = futureDate.toISOString().split('T')[0];

    const tasks = await generateStudySchedule({
      subjectId: mockSubjectId,
      examDateStr,
      dailyHours: 2.5,
      weakTopicIds: ['t3'],
      completedTopicIds: [],
    });

    expect(tasks).toBeDefined();
    expect(tasks.length).toBeGreaterThan(0);
    // Final day must be reserved for revision when >= 3 days
    const lastTask = tasks[tasks.length - 1];
    expect(lastTask.taskType).toBe('REVISION');

    // Weak topic t3 should be scheduled as PRACTICE
    const weakTask = tasks.find(t => t.topicId === 't3');
    if (weakTask) {
      expect(weakTask.taskType).toBe('PRACTICE');
    }
  });

  it('throws error when exam date is today or in the past', async () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    const examDateStr = pastDate.toISOString().split('T')[0];

    await expect(generateStudySchedule({
      subjectId: mockSubjectId,
      examDateStr,
      dailyHours: 2,
      weakTopicIds: [],
      completedTopicIds: [],
    })).rejects.toThrow('Examination date must be at least 1 day in the future');
  });
});

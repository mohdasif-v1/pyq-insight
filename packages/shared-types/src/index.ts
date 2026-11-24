export type UserRole = 'STUDENT' | 'ADMIN';

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ISubject {
  id: string;
  university: string;
  code: string;
  name: string;
  branch: string;
  semester: number;
  syllabusVersion: string;
  isActive: boolean;
}

export interface IUnit {
  id: string;
  subjectId: string;
  unitNo: number;
  title: string;
  description?: string;
}

export interface ITopic {
  id: string;
  unitId: string;
  name: string;
  description?: string;
  keywords: string[];
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  isActive: boolean;
}

export type ExamSession = 'REGULAR' | 'CARRY_OVER' | 'SPECIAL';

export interface IPaper {
  id: string;
  subjectId: string;
  year: number;
  session: ExamSession;
  examType: string;
  totalMarks: number;
  storageKey: string;
  originalFilename: string;
  fileHash: string;
  processingStatus: 'PENDING' | 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  uploadedBy: string;
  createdAt: string;
}

export type MappingStatus = 'AUTO_MAPPED' | 'REVIEW_REQUIRED' | 'ADMIN_VERIFIED' | 'UNMAPPED';

export interface IQuestion {
  id: string;
  paperId: string;
  questionNumber: string;
  subQuestionNumber?: string;
  pageNumber: number;
  originalText: string;
  normalisedText: string;
  marks?: number;
  topicId?: string;
  mappingConfidence?: number;
  mappingStatus: MappingStatus;
  clusterId?: string;
  extractionConfidence?: number;
}

export type JobType = 'PDF_EXTRACTION' | 'TOPIC_MAPPING' | 'CLUSTERING' | 'ANALYTICS_RECALCULATION';
export type JobStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface IProcessingJob {
  id: string;
  paperId?: string;
  subjectId?: string;
  jobType: JobType;
  status: JobStatus;
  attempts: number;
  progress: number;
  lastError?: string;
  lockedAt?: string;
  startedAt?: string;
  completedAt?: string;
}

export type TopicImportanceCategory = 'HIGH' | 'MEDIUM' | 'LOW';

export interface ITopicScore {
  id: string;
  subjectId: string;
  topicId: string;
  frequency: number;
  recency: number;
  marksWeight: number;
  finalScore: number;
  category: TopicImportanceCategory;
  calculationVersion: string;
  calculatedAt: string;
}

export interface ICluster {
  id: string;
  subjectId: string;
  representativeQuestionId: string;
  questionIds: string[];
  algorithm: string;
  qualityScore?: number;
  calculationVersion: string;
}

export interface IStudyTask {
  date: string;
  topicId: string;
  topicName: string;
  unitNo: number;
  durationMinutes: number;
  taskType: 'NEW_LEARNING' | 'PRACTICE' | 'REVISION' | 'MOCK_ASSESSMENT';
  completed: boolean;
}

export interface IStudyPlan {
  id: string;
  userId: string;
  subjectId: string;
  examDate: string;
  dailyHours: number;
  schedule: IStudyTask[];
  createdAt: string;
  updatedAt: string;
}

export type ProgressStatus = 'PENDING' | 'IN_PROGRESS' | 'WEAK' | 'COMPLETED';

export interface IProgress {
  id: string;
  userId: string;
  topicId: string;
  status: ProgressStatus;
  notes?: string;
  completedAt?: string;
  updatedAt: string;
}

export interface IPracticeAttempt {
  id: string;
  userId: string;
  questionId: string;
  status: 'ATTEMPTED' | 'WEAK' | 'MASTERED';
  attemptedAt: string;
}

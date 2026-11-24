import mongoose, { Schema, Document } from 'mongoose';

export interface IStudyPlanDocument extends Document {
  userId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  examDate: Date;
  dailyHours: number;
  schedule: Array<{
    date: string;
    topicId: mongoose.Types.ObjectId;
    topicName: string;
    unitNo: number;
    durationMinutes: number;
    taskType: 'NEW_LEARNING' | 'PRACTICE' | 'REVISION' | 'MOCK_ASSESSMENT';
    completed: boolean;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const StudyPlanSchema = new Schema<IStudyPlanDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
  examDate: { type: Date, required: true },
  dailyHours: { type: Number, required: true },
  schedule: [{
    date: { type: String, required: true },
    topicId: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
    topicName: { type: String, required: true },
    unitNo: { type: Number, required: true },
    durationMinutes: { type: Number, required: true },
    taskType: { 
      type: String, 
      enum: ['NEW_LEARNING', 'PRACTICE', 'REVISION', 'MOCK_ASSESSMENT'], 
      required: true 
    },
    completed: { type: Boolean, default: false }
  }]
}, {
  timestamps: true
});

StudyPlanSchema.index({ userId: 1, subjectId: 1 }, { unique: true });

export const StudyPlan = mongoose.model<IStudyPlanDocument>('StudyPlan', StudyPlanSchema);

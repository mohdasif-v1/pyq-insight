import mongoose, { Schema, Document } from 'mongoose';

export interface IProcessingJobDocument extends Document {
  paperId?: mongoose.Types.ObjectId;
  subjectId?: mongoose.Types.ObjectId;
  jobType: 'PDF_EXTRACTION' | 'TOPIC_MAPPING' | 'CLUSTERING' | 'ANALYTICS_RECALCULATION';
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  attempts: number;
  progress: number;
  lastError?: string;
  lockedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProcessingJobSchema = new Schema<IProcessingJobDocument>({
  paperId: { type: Schema.Types.ObjectId, ref: 'Paper', index: true },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', index: true },
  jobType: { 
    type: String, 
    enum: ['PDF_EXTRACTION', 'TOPIC_MAPPING', 'CLUSTERING', 'ANALYTICS_RECALCULATION'],
    required: true,
    index: true 
  },
  status: { 
    type: String, 
    enum: ['QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED'],
    default: 'QUEUED',
    index: true 
  },
  attempts: { type: Number, default: 0 },
  progress: { type: Number, default: 0 },
  lastError: { type: String },
  lockedAt: { type: Date },
  startedAt: { type: Date },
  completedAt: { type: Date }
}, {
  timestamps: true
});

ProcessingJobSchema.index({ status: 1, createdAt: 1 });

export const ProcessingJob = mongoose.model<IProcessingJobDocument>('ProcessingJob', ProcessingJobSchema);

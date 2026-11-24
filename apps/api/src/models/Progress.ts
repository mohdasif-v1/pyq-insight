import mongoose, { Schema, Document } from 'mongoose';

export interface IProgressDocument extends Document {
  userId: mongoose.Types.ObjectId;
  topicId: mongoose.Types.ObjectId;
  status: 'PENDING' | 'IN_PROGRESS' | 'WEAK' | 'COMPLETED';
  notes?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProgressSchema = new Schema<IProgressDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  topicId: { type: Schema.Types.ObjectId, ref: 'Topic', required: true, index: true },
  status: { 
    type: String, 
    enum: ['PENDING', 'IN_PROGRESS', 'WEAK', 'COMPLETED'], 
    default: 'PENDING',
    index: true 
  },
  notes: { type: String, maxlength: 1000 },
  completedAt: { type: Date }
}, {
  timestamps: true
});

ProgressSchema.index({ userId: 1, topicId: 1 }, { unique: true });

export const Progress = mongoose.model<IProgressDocument>('Progress', ProgressSchema);

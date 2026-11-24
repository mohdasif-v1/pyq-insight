import mongoose, { Schema, Document } from 'mongoose';

export interface ITopicScoreDocument extends Document {
  subjectId: mongoose.Types.ObjectId;
  topicId: mongoose.Types.ObjectId;
  frequency: number;
  recency: number;
  marksWeight: number;
  finalScore: number;
  category: 'HIGH' | 'MEDIUM' | 'LOW';
  calculationVersion: string;
  calculatedAt: Date;
}

const TopicScoreSchema = new Schema<ITopicScoreDocument>({
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
  topicId: { type: Schema.Types.ObjectId, ref: 'Topic', required: true, index: true },
  frequency: { type: Number, required: true },
  recency: { type: Number, required: true },
  marksWeight: { type: Number, required: true },
  finalScore: { type: Number, required: true },
  category: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW'], required: true, index: true },
  calculationVersion: { type: String, default: '1.0' },
  calculatedAt: { type: Date, default: Date.now }
}, {
  timestamps: false
});

TopicScoreSchema.index({ subjectId: 1, topicId: 1 }, { unique: true });

export const TopicScore = mongoose.model<ITopicScoreDocument>('TopicScore', TopicScoreSchema);

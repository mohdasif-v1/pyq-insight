import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestionDocument extends Document {
  paperId: mongoose.Types.ObjectId;
  questionNumber: string;
  subQuestionNumber?: string;
  pageNumber: number;
  originalText: string;
  normalisedText: string;
  marks?: number;
  topicId?: mongoose.Types.ObjectId;
  mappingConfidence?: number;
  mappingStatus: 'AUTO_MAPPED' | 'REVIEW_REQUIRED' | 'ADMIN_VERIFIED' | 'UNMAPPED';
  clusterId?: mongoose.Types.ObjectId;
  extractionConfidence?: number;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestionDocument>({
  paperId: { type: Schema.Types.ObjectId, ref: 'Paper', required: true, index: true },
  questionNumber: { type: String, required: true },
  subQuestionNumber: { type: String },
  pageNumber: { type: Number, default: 1 },
  originalText: { type: String, required: true },
  normalisedText: { type: String, required: true },
  marks: { type: Number },
  topicId: { type: Schema.Types.ObjectId, ref: 'Topic', index: true },
  mappingConfidence: { type: Number },
  mappingStatus: { 
    type: String, 
    enum: ['AUTO_MAPPED', 'REVIEW_REQUIRED', 'ADMIN_VERIFIED', 'UNMAPPED'],
    default: 'UNMAPPED',
    index: true 
  },
  clusterId: { type: Schema.Types.ObjectId, ref: 'Cluster', index: true },
  extractionConfidence: { type: Number, default: 1.0 }
}, {
  timestamps: true
});

QuestionSchema.index({ paperId: 1, questionNumber: 1 });

export const Question = mongoose.model<IQuestionDocument>('Question', QuestionSchema);

import mongoose, { Schema, Document } from 'mongoose';

export interface IPaperDocument extends Document {
  subjectId: mongoose.Types.ObjectId;
  year: number;
  session: 'REGULAR' | 'CARRY_OVER' | 'SPECIAL';
  examType: string;
  totalMarks: number;
  storageKey: string;
  originalFilename: string;
  fileHash: string;
  processingStatus: 'PENDING' | 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  uploadedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PaperSchema = new Schema<IPaperDocument>({
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
  year: { type: Number, required: true, index: true },
  session: { type: String, enum: ['REGULAR', 'CARRY_OVER', 'SPECIAL'], default: 'REGULAR', required: true },
  examType: { type: String, default: 'Semester Exam' },
  totalMarks: { type: Number, default: 100 },
  storageKey: { type: String, required: true },
  originalFilename: { type: String, required: true },
  fileHash: { type: String, required: true, index: true },
  processingStatus: { 
    type: String, 
    enum: ['PENDING', 'QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED'], 
    default: 'PENDING',
    index: true 
  },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
});

PaperSchema.index({ subjectId: 1, year: 1, session: 1 });

export const Paper = mongoose.model<IPaperDocument>('Paper', PaperSchema);

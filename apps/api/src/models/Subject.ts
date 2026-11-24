import mongoose, { Schema, Document } from 'mongoose';

export interface ISubjectDocument extends Document {
  university: string;
  code: string;
  name: string;
  branch: string;
  semester: number;
  syllabusVersion: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SubjectSchema = new Schema<ISubjectDocument>({
  university: { type: String, default: 'AKTU', required: true, index: true },
  code: { type: String, required: true, uppercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  branch: { type: String, default: 'CSE', required: true, index: true },
  semester: { type: Number, required: true, min: 1, max: 8, index: true },
  syllabusVersion: { type: String, default: '2022-23', required: true },
  isActive: { type: Boolean, default: true, required: true }
}, {
  timestamps: true
});

SubjectSchema.index({ code: 1, syllabusVersion: 1 }, { unique: true });

export const Subject = mongoose.model<ISubjectDocument>('Subject', SubjectSchema);

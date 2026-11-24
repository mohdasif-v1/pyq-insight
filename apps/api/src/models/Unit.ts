import mongoose, { Schema, Document } from 'mongoose';

export interface IUnitDocument extends Document {
  subjectId: mongoose.Types.ObjectId;
  unitNo: number;
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UnitSchema = new Schema<IUnitDocument>({
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
  unitNo: { type: Number, required: true, min: 1, max: 10 },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true }
}, {
  timestamps: true
});

UnitSchema.index({ subjectId: 1, unitNo: 1 }, { unique: true });

export const Unit = mongoose.model<IUnitDocument>('Unit', UnitSchema);

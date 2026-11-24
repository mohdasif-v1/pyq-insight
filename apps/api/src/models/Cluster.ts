import mongoose, { Schema, Document } from 'mongoose';

export interface IClusterDocument extends Document {
  subjectId: mongoose.Types.ObjectId;
  representativeQuestionId: mongoose.Types.ObjectId;
  questionIds: mongoose.Types.ObjectId[];
  algorithm: string;
  qualityScore?: number;
  calculationVersion: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClusterSchema = new Schema<IClusterDocument>({
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
  representativeQuestionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
  questionIds: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
  algorithm: { type: String, default: 'AgglomerativeClustering' },
  qualityScore: { type: Number },
  calculationVersion: { type: String, default: '1.0' }
}, {
  timestamps: true
});

export const Cluster = mongoose.model<IClusterDocument>('Cluster', ClusterSchema);

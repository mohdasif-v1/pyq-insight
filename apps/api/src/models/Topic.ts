import mongoose, { Schema, Document } from 'mongoose';

export interface ITopicDocument extends Document {
  unitId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  keywords: string[];
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TopicSchema = new Schema<ITopicDocument>({
  unitId: { type: Schema.Types.ObjectId, ref: 'Unit', required: true, index: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  keywords: [{ type: String, trim: true }],
  difficulty: { type: String, enum: ['EASY', 'MEDIUM', 'HARD'], default: 'MEDIUM' },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

TopicSchema.index({ unitId: 1, name: 1 }, { unique: true });

export const Topic = mongoose.model<ITopicDocument>('Topic', TopicSchema);

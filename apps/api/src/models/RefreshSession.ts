import mongoose, { Schema, Document } from 'mongoose';

export interface IRefreshSessionDocument extends Document {
  userId: mongoose.Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  revokedAt?: Date;
  createdAt: Date;
}

const RefreshSessionSchema = new Schema<IRefreshSessionDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tokenHash: { type: String, required: true, unique: true, index: true },
  expiresAt: { type: Date, required: true, index: true },
  revokedAt: { type: Date, default: null }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

export const RefreshSession = mongoose.model<IRefreshSessionDocument>('RefreshSession', RefreshSessionSchema);

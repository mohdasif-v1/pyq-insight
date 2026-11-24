import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { config } from '../config/index.js';

export interface IStorageProvider {
  save(buffer: Buffer, originalFilename: string): Promise<{ storageKey: string; fileHash: string }>;
  get(storageKey: string): Promise<Buffer>;
  delete(storageKey: string): Promise<void>;
  getFilePath(storageKey: string): string;
}

export class LocalStorageProvider implements IStorageProvider {
  private baseDir: string;

  constructor() {
    this.baseDir = path.resolve(config.storage.localDir);
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  async save(buffer: Buffer, originalFilename: string): Promise<{ storageKey: string; fileHash: string }> {
    const fileHash = crypto.createHash('sha256').update(buffer).digest('hex');
    const ext = path.extname(originalFilename) || '.pdf';
    const storageKey = `${fileHash}_${Date.now()}${ext}`;
    const destination = path.join(this.baseDir, storageKey);

    // Prevent path traversal
    if (!destination.startsWith(this.baseDir)) {
      throw new Error('Invalid storage destination path');
    }

    await fs.promises.writeFile(destination, buffer);
    return { storageKey, fileHash };
  }

  async get(storageKey: string): Promise<Buffer> {
    const filePath = this.getFilePath(storageKey);
    return fs.promises.readFile(filePath);
  }

  async delete(storageKey: string): Promise<void> {
    const filePath = this.getFilePath(storageKey);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }

  getFilePath(storageKey: string): string {
    // Basic sanitization against path traversal
    const safeKey = path.basename(storageKey);
    return path.join(this.baseDir, safeKey);
  }
}

export const storageProvider = new LocalStorageProvider();

import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiPrefix: '/api/v1',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/pyq_insight',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev_super_secret_jwt_access_key_pyq_insight_2026',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_super_secret_jwt_refresh_key_pyq_insight_2026',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  cookieSecret: process.env.COOKIE_SECRET || 'dev_cookie_secret_pyq_insight',
  mlService: {
    url: process.env.ML_SERVICE_URL || 'http://localhost:8000',
    apiKey: process.env.ML_SERVICE_API_KEY || 'internal_pyq_insight_ml_secret_key',
  },
  storage: {
    type: process.env.UPLOAD_STORAGE_TYPE || 'local',
    localDir: process.env.UPLOAD_LOCAL_DIR || './uploads/papers',
    maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '15', 10),
    maxPageCount: parseInt(process.env.MAX_PAGE_COUNT || '25', 10),
  },
  worker: {
    maxAttempts: parseInt(process.env.MAX_JOB_ATTEMPTS || '3', 10),
    lockTimeoutMs: parseInt(process.env.JOB_LOCK_TIMEOUT_MS || '300000', 10),
    pollIntervalMs: parseInt(process.env.JOB_POLL_INTERVAL_MS || '3000', 10),
  }
};

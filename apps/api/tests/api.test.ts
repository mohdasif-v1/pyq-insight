import request from 'supertest';
import { createApp } from '../src/app.js';

describe('API Health and Security Tests', () => {
  const app = createApp();

  it('GET /api/v1/health returns healthy status', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.service).toBe('pyq-insight-api');
  });

  it('Rejects unauthenticated access to protected routes', async () => {
    const res = await request(app).get('/api/v1/subjects');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('Validates auth registration payload schema with Zod', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'A',
        email: 'invalid-email',
        password: 'short',
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Validation Error');
  });
});

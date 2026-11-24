export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'PYQ Insight API',
    version: '1.0.0',
    description: 'Academic Exam Intelligence Platform for AKTU B.Tech',
  },
  servers: [
    { url: '/api/v1', description: 'API v1 Root' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  paths: {
    '/health': {
      get: {
        summary: 'Health check endpoint',
        responses: { 200: { description: 'Service is healthy' } },
      },
    },
    '/auth/register': {
      post: {
        summary: 'Register student or admin',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object' } } },
        },
        responses: { 201: { description: 'Registered successfully' } },
      },
    },
    '/auth/login': {
      post: {
        summary: 'User login',
        responses: { 200: { description: 'Authenticated successfully' } },
      },
    },
    '/subjects': {
      get: {
        summary: 'List active subjects',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'List of subjects' } },
      },
    },
    '/papers': {
      get: {
        summary: 'List papers',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'List of papers' } },
      },
      post: {
        summary: 'Upload PYQ PDF Paper (Admin)',
        security: [{ bearerAuth: [] }],
        responses: { 201: { description: 'Paper uploaded and queued' } },
      },
    },
    '/analytics/subjects/{subjectId}': {
      get: {
        summary: 'Get subject topic heatmap, marks distribution, and trend analytics',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Subject analytics' } },
      },
    },
    '/study-plans/subjects/{subjectId}': {
      get: {
        summary: 'Get generated study plan for subject',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Study plan' } },
      },
    },
    '/study-plans': {
      post: {
        summary: 'Generate study schedule using greedy scheduler',
        security: [{ bearerAuth: [] }],
        responses: { 201: { description: 'Study plan generated' } },
      },
    },
  },
};

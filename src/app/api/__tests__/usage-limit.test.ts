import { NextRequest } from 'next/server';
import { GET, PUT } from '../profile/usage-limit/route';

// Mock the mock database
const mockDb = {
  users: new Map(),
  sessionUsage: new Map(),
};

// Mock the getCurrentUser function
jest.mock('../../profile/usage-limit/route', () => {
  const originalModule = jest.requireActual('../../profile/usage-limit/route');
  return {
    ...originalModule,
    getCurrentUser: jest.fn(() => 'user-001'),
  };
});

describe('/api/profile/usage-limit', () => {
  beforeEach(() => {
    // Reset mock database
    mockDb.users.clear();
    mockDb.sessionUsage.clear();
    
    // Set up test user
    mockDb.users.set('user-001', {
      id: 'user-001',
      daily_usage_limit_minutes: null,
      last_limit_update_at: null,
      requires_reauth: false,
    });
  });

  describe('GET', () => {
    it('should return usage data for authenticated user', async () => {
      const request = new NextRequest('http://localhost:3000/api/profile/usage-limit');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('dailyLimitMinutes');
      expect(data).toHaveProperty('todayUsageMinutes');
      expect(data).toHaveProperty('requiresReauth');
      expect(data).toHaveProperty('lastLimitUpdateAt');
      expect(data).toHaveProperty('limitReached');
    });

    it('should return 401 for unauthenticated user', async () => {
      // Mock getCurrentUser to return null
      const { getCurrentUser } = require('../../profile/usage-limit/route');
      getCurrentUser.mockReturnValueOnce(null);

      const request = new NextRequest('http://localhost:3000/api/profile/usage-limit');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 404 for non-existent user', async () => {
      // Mock getCurrentUser to return non-existent user
      const { getCurrentUser } = require('../../profile/usage-limit/route');
      getCurrentUser.mockReturnValueOnce('non-existent-user');

      const request = new NextRequest('http://localhost:3000/api/profile/usage-limit');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('User not found');
    });
  });

  describe('PUT', () => {
    it('should update usage limit successfully', async () => {
      const request = new NextRequest('http://localhost:3000/api/profile/usage-limit', {
        method: 'PUT',
        body: JSON.stringify({ dailyLimitMinutes: 120 }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.dailyLimitMinutes).toBe(120);
      expect(data.requiresReauth).toBe(true);
      expect(data.lastLimitUpdateAt).toBeTruthy();
    });

    it('should set limit to null (disable limit)', async () => {
      const request = new NextRequest('http://localhost:3000/api/profile/usage-limit', {
        method: 'PUT',
        body: JSON.stringify({ dailyLimitMinutes: null }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.dailyLimitMinutes).toBe(null);
      expect(data.requiresReauth).toBe(true);
    });

    it('should return 400 for invalid limit value (too low)', async () => {
      const request = new NextRequest('http://localhost:3000/api/profile/usage-limit', {
        method: 'PUT',
        body: JSON.stringify({ dailyLimitMinutes: 10 }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Daily limit must be between 15 and 480 minutes');
    });

    it('should return 400 for invalid limit value (too high)', async () => {
      const request = new NextRequest('http://localhost:3000/api/profile/usage-limit', {
        method: 'PUT',
        body: JSON.stringify({ dailyLimitMinutes: 500 }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Daily limit must be between 15 and 480 minutes');
    });

    it('should return 400 for invalid increment (not 15-minute steps)', async () => {
      const request = new NextRequest('http://localhost:3000/api/profile/usage-limit', {
        method: 'PUT',
        body: JSON.stringify({ dailyLimitMinutes: 25 }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Daily limit must be in 15-minute increments');
    });

    it('should return 401 when reauth is required', async () => {
      // Set user to require reauth
      mockDb.users.set('user-001', {
        id: 'user-001',
        daily_usage_limit_minutes: 120,
        last_limit_update_at: '2025-10-25T10:00:00Z',
        requires_reauth: true,
      });

      const request = new NextRequest('http://localhost:3000/api/profile/usage-limit', {
        method: 'PUT',
        body: JSON.stringify({ dailyLimitMinutes: 90 }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Please log in again to change your usage limit');
    });

    it('should return 401 for unauthenticated user', async () => {
      // Mock getCurrentUser to return null
      const { getCurrentUser } = require('../../profile/usage-limit/route');
      getCurrentUser.mockReturnValueOnce(null);

      const request = new NextRequest('http://localhost:3000/api/profile/usage-limit', {
        method: 'PUT',
        body: JSON.stringify({ dailyLimitMinutes: 120 }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 404 for non-existent user', async () => {
      // Mock getCurrentUser to return non-existent user
      const { getCurrentUser } = require('../../profile/usage-limit/route');
      getCurrentUser.mockReturnValueOnce('non-existent-user');

      const request = new NextRequest('http://localhost:3000/api/profile/usage-limit', {
        method: 'PUT',
        body: JSON.stringify({ dailyLimitMinutes: 120 }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('User not found');
    });
  });
});

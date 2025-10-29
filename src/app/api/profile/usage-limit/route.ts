import { NextRequest, NextResponse } from 'next/server';
import { UsageLimitResponse } from '@/types/profile';
import { DemoUsageService } from '@/lib/demoUsageService';

// Helper function to get user from session (mock)
function getCurrentUser(request: NextRequest): string | null {
  // In production, extract user from JWT token or session
  return 'user-001'; // Mock user ID
}

// GET: Retrieve current usage limit and today's usage
export async function GET(request: NextRequest) {
  try {
    const userId = getCurrentUser(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const demoService = DemoUsageService.getInstance();
    const userState = demoService.getUserState(userId);
    const todayUsageMinutes = demoService.calculateTodayUsage(userId);
    const limitReached = userState.dailyLimitMinutes 
      ? todayUsageMinutes >= userState.dailyLimitMinutes 
      : false;

    const response: UsageLimitResponse = {
      dailyLimitMinutes: userState.dailyLimitMinutes,
      todayUsageMinutes,
      requiresReauth: userState.requiresReauth,
      lastLimitUpdateAt: userState.lastLimitUpdateAt,
      limitReached,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching usage limit:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Update daily usage limit
export async function PUT(request: NextRequest) {
  try {
    const userId = getCurrentUser(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const demoService = DemoUsageService.getInstance();
    const userState = demoService.getUserState(userId);

    // Check if reauth is required
    if (userState.requiresReauth) {
      return NextResponse.json(
        { error: 'Please log in again to change your usage limit' }, 
        { status: 401 }
      );
    }

    const body = await request.json();
    const { dailyLimitMinutes } = body;

    // Validation
    if (dailyLimitMinutes !== null) {
      if (typeof dailyLimitMinutes !== 'number' || dailyLimitMinutes < 15 || dailyLimitMinutes > 480) {
        return NextResponse.json(
          { error: 'Daily limit must be between 15 and 480 minutes' }, 
          { status: 400 }
        );
      }

      if (dailyLimitMinutes % 15 !== 0) {
        return NextResponse.json(
          { error: 'Daily limit must be in 15-minute increments' }, 
          { status: 400 }
        );
      }
    }

    // Update user state
    demoService.updateUserState(userId, {
      dailyLimitMinutes,
      lastLimitUpdateAt: new Date().toISOString(),
      requiresReauth: true,
    });

    const todayUsageMinutes = demoService.calculateTodayUsage(userId);
    const limitReached = dailyLimitMinutes 
      ? todayUsageMinutes >= dailyLimitMinutes 
      : false;

    const response: UsageLimitResponse = {
      dailyLimitMinutes,
      todayUsageMinutes,
      requiresReauth: true,
      lastLimitUpdateAt: new Date().toISOString(),
      limitReached,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating usage limit:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

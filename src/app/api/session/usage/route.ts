import { NextRequest, NextResponse } from 'next/server';
import { SessionHeartbeatResponse } from '@/types/profile';
import { DemoUsageService } from '@/lib/demoUsageService';

// Helper function to get user from session (mock)
function getCurrentUser(request: NextRequest): string | null {
  // In production, extract user from JWT token or session
  return 'user-001'; // Mock user ID
}

// POST: Update session usage (heartbeat)
export async function POST(request: NextRequest) {
  try {
    const userId = getCurrentUser(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId, consumedMinutes } = body;

    if (!sessionId || typeof consumedMinutes !== 'number') {
      return NextResponse.json(
        { error: 'sessionId and consumedMinutes are required' }, 
        { status: 400 }
      );
    }

    const demoService = DemoUsageService.getInstance();
    const sessionSummary = demoService.upsertSessionUsage({
      sessionId,
      userId,
      consumedMinutes,
      timestamp: new Date(),
    });

    const response: SessionHeartbeatResponse = {
      consumedMinutes: sessionSummary.consumedMinutes,
      limitReached: sessionSummary.limitReached,
      shouldLogout: sessionSummary.shouldLogout,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating session usage:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET: Retrieve current session usage
export async function GET(request: NextRequest) {
  try {
    const userId = getCurrentUser(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const demoService = DemoUsageService.getInstance();
    const todayUsageMinutes = demoService.calculateTodayUsage(userId);
    const userState = demoService.getUserState(userId);
    const limitReached = userState.dailyLimitMinutes 
      ? todayUsageMinutes >= userState.dailyLimitMinutes 
      : false;

    const response: SessionHeartbeatResponse = {
      consumedMinutes: todayUsageMinutes,
      limitReached,
      shouldLogout: limitReached,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching session usage:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

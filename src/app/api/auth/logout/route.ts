import { NextResponse } from 'next/server'

export async function POST() {
  // Simple logout endpoint
  return NextResponse.json({ message: 'Logged out successfully' })
}
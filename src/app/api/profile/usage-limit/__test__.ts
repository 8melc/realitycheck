/**
 * Dev-Test für Tagesnutzung-Berechnung
 * 
 * Test-Szenario:
 * - Session A: 75 Minuten (beendet)
 * - Session B: 30 Minuten (beendet)
 * - Erwartetes Ergebnis: todayUsageMinutes = 105
 * 
 * Dieser Test kann manuell in der DB ausgeführt werden:
 * 
 * INSERT INTO user_sessions (user_id, session_start, session_end, duration_minutes)
 * VALUES 
 *   ('USER_ID_HIER', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '45 minutes', 75),
 *   ('USER_ID_HIER', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '30 minutes', 30);
 * 
 * Dann GET /api/profile/usage-limit aufrufen und prüfen:
 * - todayUsageMinutes sollte 105 sein
 */

import { NextRequest } from 'next/server';
import { GET } from '../route';

/**
 * Manueller Test (nur in Development)
 * 
 * Führe diesen Test aus, indem du:
 * 1. Zwei Test-Sessions in der DB erstellst (siehe SQL oben)
 * 2. Diese Funktion aufrufst
 * 3. Prüfst, ob todayUsageMinutes = 105 ist
 */
export async function testUsageCalculation() {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('[Test] Nur in Development verfügbar');
    return;
  }

  const request = new NextRequest('http://localhost:3000/api/profile/usage-limit');
  const response = await GET(request);
  const data = await response.json();

  console.log('[Test] Usage Limit Response:', data);
  
  // Erwartetes Ergebnis: 105 Minuten (75 + 30)
  const expectedMinutes = 105;
  const actualMinutes = data.todayUsageMinutes;
  
  if (actualMinutes === expectedMinutes) {
    console.log(`✅ [Test] PASSED: todayUsageMinutes = ${actualMinutes} (erwartet: ${expectedMinutes})`);
  } else {
    console.error(`❌ [Test] FAILED: todayUsageMinutes = ${actualMinutes} (erwartet: ${expectedMinutes})`);
  }
  
  return data;
}

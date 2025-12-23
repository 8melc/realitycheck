// Quick test script for focus window function
// Run: node test-focus-window.mjs

function isInFocusWindow(now, focusTime) {
  const h = now.getHours();
  
  if (focusTime === 'Morgen') return h >= 6 && h < 12;
  if (focusTime === 'Nachmittag') return h >= 12 && h < 18;
  if (focusTime === 'Abend') return h >= 18 && h < 22;
  if (focusTime === 'Spät') return h >= 22 || h < 6;
  
  return true;
}

// Test cases
const now = new Date();
console.log('Aktuelle Zeit:', now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }));
console.log('Aktuelle Stunde:', now.getHours());
console.log('');

const testCases = [
  { time: 'Morgen', expected: now.getHours() >= 6 && now.getHours() < 12 },
  { time: 'Nachmittag', expected: now.getHours() >= 12 && now.getHours() < 18 },
  { time: 'Abend', expected: now.getHours() >= 18 && now.getHours() < 22 },
  { time: 'Spät', expected: now.getHours() >= 22 || now.getHours() < 6 },
];

testCases.forEach(({ time, expected }) => {
  const result = isInFocusWindow(now, time);
  const status = result === expected ? '✅' : '❌';
  console.log(`${status} ${time}: ${result} (erwartet: ${expected})`);
});

// Test with specific times
console.log('\n--- Test mit spezifischen Zeiten ---');
const testTimes = [
  { hour: 8, label: '8:00 (Morgen)' },
  { hour: 14, label: '14:00 (Nachmittag)' },
  { hour: 20, label: '20:00 (Abend)' },
  { hour: 23, label: '23:00 (Spät)' },
  { hour: 2, label: '2:00 (Spät)' },
];

testTimes.forEach(({ hour, label }) => {
  const testDate = new Date();
  testDate.setHours(hour, 0, 0, 0);
  
  console.log(`\n${label}:`);
  console.log(`  Morgen: ${isInFocusWindow(testDate, 'Morgen')}`);
  console.log(`  Nachmittag: ${isInFocusWindow(testDate, 'Nachmittag')}`);
  console.log(`  Abend: ${isInFocusWindow(testDate, 'Abend')}`);
  console.log(`  Spät: ${isInFocusWindow(testDate, 'Spät')}`);
});


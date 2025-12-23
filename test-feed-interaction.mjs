/**
 * Test-Script: Prüft Feed-Interaction API
 * 
 * Usage: node test-feed-interaction.mjs
 * 
 * Setze Environment-Variablen oder nutze .env.local
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadEnvFile(filename) {
  try {
    const envPath = join(__dirname, filename);
    const content = readFileSync(envPath, 'utf-8');
    const env = {};
    content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, '');
          env[key.trim()] = value.trim();
        }
      }
    });
    return env;
  } catch (e) {
    return {};
  }
}

const envLocal = loadEnvFile('.env.local');
const env = loadEnvFile('.env');
const allEnv = { ...env, ...envLocal, ...process.env };

const API_URL = allEnv.NEXT_PUBLIC_SUPABASE_URL 
  ? `http://localhost:3000` 
  : 'http://localhost:3000';

console.log('🧪 Test Feed-Interaction API\n');
console.log('='.repeat(60));

// Test 1: Prüfe ob API erreichbar ist
console.log('\n1️⃣  Test: API erreichbar?');
try {
  const healthCheck = await fetch(`${API_URL}/api/feedboard/interactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content_id: 'test', action: 'bookmark' }),
  });
  
  const responseText = await healthCheck.text();
  console.log(`   Status: ${healthCheck.status}`);
  console.log(`   Response: ${responseText.substring(0, 200)}`);
  
  if (healthCheck.status === 401) {
    console.log('   ✅ API ist erreichbar, aber Auth erforderlich (erwartet)');
  } else if (healthCheck.status === 400) {
    console.log('   ✅ API ist erreichbar, Validation funktioniert');
  } else {
    console.log('   ⚠️  Unerwarteter Status');
  }
} catch (error) {
  console.error('   ❌ API nicht erreichbar:', error.message);
  console.log('   💡 Stelle sicher, dass der Dev-Server läuft (npm run dev)');
}

console.log('\n' + '='.repeat(60));
console.log('✅ Test abgeschlossen\n');
console.log('💡 Nächste Schritte:');
console.log('   1. Öffne Browser DevTools → Network Tab');
console.log('   2. Klicke auf "Mehr davon" Button');
console.log('   3. Prüfe Request zu /api/feedboard/interactions');
console.log('   4. Prüfe Response Status & Body');
console.log('   5. Prüfe Server-Logs für [Feed Interactions] Logs\n');



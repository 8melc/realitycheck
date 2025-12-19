/**
 * Test-Script: Prüft ob die Guide-Query Items findet
 * 
 * Usage: node test-guide-query.mjs
 * 
 * Setze vorher: SUPABASE_URL und SUPABASE_ANON_KEY als Environment-Variablen
 */

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Fehlende Environment-Variablen: SUPABASE_URL oder SUPABASE_ANON_KEY');
  process.exit(1);
}

// Simuliere die Query aus guide/chat/route.ts
const allowedFormats = ['Artikel', 'article', 'Article', 'Podcast', 'podcast', 'Zitat', 'quote', 'Quote'];

async function testQuery() {
  console.log('🧪 Teste Guide-Query...\n');
  console.log('📋 Erlaubte Formate:', allowedFormats);
  console.log('📋 Filter: is_published = true\n');

  const url = `${SUPABASE_URL}/rest/v1/content_items?select=id,title,format,cluster,read_time_minutes,is_published&is_published=eq.true&format=in.(${allowedFormats.map(f => `"${f}"`).join(',')})&order=created_at.desc&limit=3`;
  
  console.log('🔗 Query URL:', url.replace(SUPABASE_ANON_KEY, '***'));
  console.log('');

  try {
    const response = await fetch(url, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Query fehlgeschlagen:', response.status, errorText);
      return;
    }

    const data = await response.json();
    
    console.log(`✅ Gefunden: ${data.length} Items\n`);
    
    if (data.length > 0) {
      console.log('📦 Items:');
      data.forEach((item, i) => {
        console.log(`  ${i + 1}. [${item.format}] ${item.title} (Cluster: ${item.cluster}, ${item.read_time_minutes}min)`);
      });
    } else {
      console.log('⚠️  Keine Items gefunden!');
      console.log('\n🔍 Mögliche Ursachen:');
      console.log('  - Format-Werte stimmen nicht überein');
      console.log('  - Items sind nicht is_published = true');
      console.log('  - Query-Syntax-Problem');
    }
  } catch (error) {
    console.error('❌ Fehler:', error.message);
  }
}

testQuery();

/**
 * Test-Script: Prüft Content-Statistiken API
 * 
 * Usage: 
 *   node test-content-stats.mjs
 * 
 * Oder direkt im Browser:
 *   http://localhost:3000/api/content/stats
 */

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.log('ℹ️  Teste direkt gegen Supabase...\n');
  
  // Direkte Supabase Query
  testDirectQuery();
} else {
  console.log('ℹ️  Teste über API-Endpoint...\n');
  testAPIEndpoint();
}

async function testDirectQuery() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ Fehlende Environment-Variablen');
    return;
  }

  try {
    // Gesamtanzahl
    const totalUrl = `${SUPABASE_URL}/rest/v1/content_items?select=*&limit=0`;
    const totalRes = await fetch(totalUrl, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'count=exact',
      },
    });
    const totalCount = totalRes.headers.get('content-range')?.split('/')[1] || 0;

    // Veröffentlichte
    const publishedUrl = `${SUPABASE_URL}/rest/v1/content_items?select=*&is_published=eq.true&limit=0`;
    const publishedRes = await fetch(publishedUrl, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'count=exact',
      },
    });
    const publishedCount = publishedRes.headers.get('content-range')?.split('/')[1] || 0;

    // Nach Format
    const formatUrl = `${SUPABASE_URL}/rest/v1/content_items?select=format&is_published=eq.true`;
    const formatRes = await fetch(formatUrl, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    const formatData = await formatRes.json();
    
    const formatCounts = {};
    formatData.forEach(item => {
      const f = item.format || 'unknown';
      formatCounts[f] = (formatCounts[f] || 0) + 1;
    });

    // Nach Cluster
    const clusterUrl = `${SUPABASE_URL}/rest/v1/content_items?select=cluster,format&is_published=eq.true`;
    const clusterRes = await fetch(clusterUrl, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    const clusterData = await clusterRes.json();
    
    const clusterCounts = {};
    clusterData.forEach(item => {
      const c = item.cluster || 'unknown';
      const f = item.format || 'unknown';
      if (!clusterCounts[c]) {
        clusterCounts[c] = { total: 0, byFormat: {} };
      }
      clusterCounts[c].total += 1;
      clusterCounts[c].byFormat[f] = (clusterCounts[c].byFormat[f] || 0) + 1;
    });

    console.log('📊 Content-Statistiken:\n');
    console.log(`📦 Gesamt: ${totalCount} Items`);
    console.log(`✅ Veröffentlicht: ${publishedCount} Items`);
    console.log(`❌ Nicht veröffentlicht: ${totalCount - publishedCount} Items\n`);
    
    console.log('📋 Nach Format:');
    Object.entries(formatCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([format, count]) => {
        console.log(`  ${format}: ${count}`);
      });
    
    console.log('\n🎯 Nach Cluster/Thema:');
    Object.entries(clusterCounts)
      .sort((a, b) => b[1].total - a[1].total)
      .forEach(([cluster, stats]) => {
        console.log(`  ${cluster}: ${stats.total} Items`);
        Object.entries(stats.byFormat).forEach(([format, count]) => {
          console.log(`    - ${format}: ${count}`);
        });
      });

  } catch (error) {
    console.error('❌ Fehler:', error.message);
  }
}

async function testAPIEndpoint() {
  try {
    const response = await fetch('http://localhost:3000/api/content/stats');
    if (!response.ok) {
      console.error('❌ API-Fehler:', response.status);
      return;
    }
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Fehler:', error.message);
    console.log('\n💡 Tipp: Stelle sicher, dass der Dev-Server läuft (npm run dev)');
  }
}


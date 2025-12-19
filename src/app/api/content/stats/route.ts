import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * GET /api/content/stats
 * 
 * Gibt Statistiken über alle Content-Items zurück:
 * - Gesamtanzahl aller Items
 * - Anzahl nach Format (article, podcast, quote)
 * - Anzahl nach Cluster/Thema
 * - Anzahl veröffentlichte vs. nicht-veröffentlichte Items
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    // Gesamtanzahl aller Items
    const { count: totalCount } = await supabase
      .from('content_items')
      .select('*', { count: 'exact', head: true });

    // Anzahl veröffentlichte Items
    const { count: publishedCount } = await supabase
      .from('content_items')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true);

    // Anzahl nach Format
    const { data: formatStats } = await supabase
      .from('content_items')
      .select('format, is_published')
      .eq('is_published', true);

    const formatCounts: Record<string, number> = {};
    formatStats?.forEach((item) => {
      const format = item.format || 'unknown';
      formatCounts[format] = (formatCounts[format] || 0) + 1;
    });

    // Anzahl nach Cluster/Thema
    const { data: clusterStats } = await supabase
      .from('content_items')
      .select('cluster, format, is_published')
      .eq('is_published', true);

    const clusterCounts: Record<string, { total: number; byFormat: Record<string, number> }> = {};
    clusterStats?.forEach((item) => {
      const cluster = item.cluster || 'unknown';
      const format = item.format || 'unknown';
      
      if (!clusterCounts[cluster]) {
        clusterCounts[cluster] = { total: 0, byFormat: {} };
      }
      clusterCounts[cluster].total += 1;
      clusterCounts[cluster].byFormat[format] = (clusterCounts[cluster].byFormat[format] || 0) + 1;
    });

    // Sortiere Cluster nach Anzahl (absteigend)
    const sortedClusters = Object.entries(clusterCounts)
      .map(([cluster, stats]) => ({
        cluster,
        total: stats.total,
        byFormat: stats.byFormat,
      }))
      .sort((a, b) => b.total - a.total);

    return NextResponse.json({
      summary: {
        total: totalCount || 0,
        published: publishedCount || 0,
        unpublished: (totalCount || 0) - (publishedCount || 0),
      },
      byFormat: formatCounts,
      byCluster: sortedClusters,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching content stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content statistics' },
      { status: 500 }
    );
  }
}

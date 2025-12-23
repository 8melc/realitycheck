import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { ContentItem } from '@/lib/types/database.types';
import type { FeedItem } from '@/types/feedboard';

/**
 * Map cluster slugs from database to frontend display names
 */
const CLUSTER_NAME_MAP: Record<string, string> = {
  'time_focus': 'Zeit & Endlichkeit',
  'focus_flow': 'Fokus & Flow',
  'freedom': 'Freiheit & Orte',
  'growth': 'Wachstum',
  'meaning': 'Sinn & Bedeutung',
  'culture': 'Kultur & Stimmen',
  'relationships': 'Beziehungen',
  'self_knowledge': 'Selbsterkenntnis',
  'money_value': 'Geld & Wert'
};

/**
 * Map content_type and format to FeedItem format
 */
function mapFormat(contentType: string | null, format: string | null): FeedItem['format'] {
  if (format) {
    const normalizedFormat = format.trim();
    if (['Zitat', 'Artikel', 'Event', 'People', 'Podcast', 'Song'].includes(normalizedFormat)) {
      return normalizedFormat as FeedItem['format'];
    }
  }

  const formatMap: Record<string, FeedItem['format']> = {
    'article': 'Artikel',
    'podcast': 'Podcast',
    'quote': 'Zitat',
    'event': 'Event',
    'person': 'People',
    'person_profile': 'People',
  };

  return formatMap[contentType || ''] || 'Artikel';
}

/**
 * Map ContentItem from database to FeedItem for the feedboard UI
 */
function mapContentItemToFeedItem(item: ContentItem): FeedItem {
  const description = item.subtitle ?? item.quote_text ?? '';
  const format = mapFormat(item.content_type, item.format);
  
  // Map cluster slug to display name if needed
  const rawCluster = item.cluster || 'Zeit & Endlichkeit';
  const theme = (CLUSTER_NAME_MAP[rawCluster] || rawCluster) as FeedItem['theme'];

  return {
    id: item.id,
    title: item.title || '',
    description,
    format,
    theme,
    perma: 'Meaning', // Default
    link: item.url || '#',
    image: (item as any).thumbnail_url || '', // thumbnail_url exists in DB but not in generated types yet 
    guideWhy: description,
    source: (item.source || 'feedboard') as 'feedboard' | 'guide' | 'manual',
    chips: [],
    guideComment: item.subtitle || item.quote_text || '',
    isHero: false,
    isSilence: false,
    hasGlitch: false,
    isPartner: false,
  };
}

/**
 * GET /api/feedboard/items
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clusterParam = searchParams.get('cluster');
    const limit = parseInt(searchParams.get('limit') || '50');

    const supabase = await createSupabaseServerClient();
    
    let query = supabase
      .from('content_items')
      .select('*')
      .eq('is_published', true) // Only fetch published items
      .order('created_at', { ascending: false })
      .limit(limit);

    // If cluster is provided, filter by it
    if (clusterParam && clusterParam !== 'all') {
      query = query.eq('cluster', clusterParam);
    }

    const { data: contentItems, error } = await query;
    
    // Debug logging
    console.log(`[API] Query params: cluster=${clusterParam || 'all'}, limit=${limit}`);
    console.log(`[API] Raw DB results: ${contentItems?.length || 0} items`);
    if (contentItems && contentItems.length > 0) {
      console.log(`[API] Sample cluster values:`, contentItems.slice(0, 5).map(item => item.cluster));
    }

    if (error) {
      console.error('Error fetching content items:', error);
      return NextResponse.json({ error: 'Failed to load content items' }, { status: 500 });
    }

    // Map to FeedItems
    const feedItems: FeedItem[] = (contentItems || []).map((item, index) => {
      const feedItem = mapContentItemToFeedItem(item);
      if (index === 0 && !clusterParam) {
        feedItem.isHero = true;
      }
      return feedItem;
    });

    // Debug logging after mapping
    console.log(`[API] Mapped to ${feedItems.length} FeedItems`);
    if (feedItems.length > 0) {
      const themeCounts = feedItems.reduce((acc, item) => {
        acc[item.theme] = (acc[item.theme] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      console.log(`[API] Theme distribution:`, themeCounts);
      console.log(`[API] Sample themes:`, feedItems.slice(0, 5).map(item => item.theme));
    }

    return NextResponse.json({ 
      items: feedItems,
      _count: feedItems.length
    });
  } catch (error) {
    console.error('Error in feedboard items API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}




import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { ContentItem } from '@/lib/types/database.types';
import type { FeedItem } from '@/types/feedboard';

/**
 * Map ContentItem from database to FeedItem for the feedboard UI
 */
function mapContentItemToFeedItem(item: ContentItem): FeedItem {
  // Map content_type to format
  const formatMap: Record<string, FeedItem['format']> = {
    'article': 'Artikel',
    'podcast': 'Podcast',
    'quote': 'Zitat',
    'event': 'Event',
    'person': 'People',
  };

  // Use format from DB if available, otherwise map from content_type
  let format: FeedItem['format'] = 'Artikel'; // default
  if (item.format) {
    // Try to match format string directly
    const normalizedFormat = item.format.trim();
    if (['Zitat', 'Artikel', 'Event', 'People', 'Podcast', 'Song'].includes(normalizedFormat)) {
      format = normalizedFormat as FeedItem['format'];
    } else {
      format = formatMap[item.content_type] || 'Artikel';
    }
  } else {
    format = formatMap[item.content_type] || 'Artikel';
  }

  // Map cluster to theme (assuming cluster values match theme values)
  const theme = (item.cluster || 'Zeit & Endlichkeit') as FeedItem['theme'];

  // Default PERMA value - can be enhanced later if PERMA is stored in DB
  const perma: FeedItem['perma'] = 'Meaning';

  return {
    id: item.id,
    title: item.title || '',
    description: item.description || '',
    format,
    theme,
    perma,
    link: item.url || '#',
    image: item.image_url || '',
    guideWhy: item.description || '', // Fallback to description if why_this_item doesn't exist
    source: 'feedboard',
    chips: [],
    guideComment: item.description || '', // Use description as comment for now
    isHero: false,
    isSilence: false,
    hasGlitch: false,
    isPartner: false,
  };
}

/**
 * GET /api/feedboard/items
 * Get all published content items from Supabase
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Fetch all content_items where is_published = true
    // Sort by cluster and title as requested
    const { data: contentItems, error } = await supabase
      .from('content_items')
      .select('*')
      .eq('is_published', true)
      .order('cluster', { ascending: true })
      .order('title', { ascending: true });

    if (error) {
      console.error('Error fetching content items:', error);
      return NextResponse.json(
        { error: 'Failed to load content items' },
        { status: 500 }
      );
    }

    // Map ContentItems to FeedItems
    const feedItems: FeedItem[] = (contentItems || []).map(mapContentItemToFeedItem);

    return NextResponse.json({ items: feedItems });
  } catch (error) {
    console.error('Error in feedboard items API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

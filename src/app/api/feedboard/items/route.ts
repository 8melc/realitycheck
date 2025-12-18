import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { ContentItem } from '@/lib/types/database.types';
import type { FeedItem } from '@/types/feedboard';

/**
 * Map content_type and format to FeedItem format
 */
function mapFormat(contentType: string | null, format: string | null): FeedItem['format'] {
  // If format field exists and matches FeedItem format, use it directly
  if (format) {
    const normalizedFormat = format.trim();
    if (['Zitat', 'Artikel', 'Event', 'People', 'Podcast', 'Song'].includes(normalizedFormat)) {
      return normalizedFormat as FeedItem['format'];
    }
  }

  // Map content_type to format
  const formatMap: Record<string, FeedItem['format']> = {
    'article': 'Artikel',
    'podcast': 'Podcast',
    'quote': 'Zitat',
    'event': 'Event',
    'person': 'People',
  };

  return formatMap[contentType || ''] || 'Artikel';
}

/**
 * Map ContentItem from database to FeedItem for the feedboard UI
 */
function mapContentItemToFeedItem(item: ContentItem): FeedItem {
  // Use subtitle, fallback to quote_text for quotes, otherwise empty string
  const description = item.subtitle ?? item.quote_text ?? '';

  // Map format using content_type and format fields
  const format = mapFormat(item.content_type, item.format);

  // Map cluster to theme (cluster values should match theme values)
  const theme = (item.cluster || 'Zeit & Endlichkeit') as FeedItem['theme'];

  // Default PERMA value - can be enhanced later if PERMA is stored in DB
  const perma: FeedItem['perma'] = 'Meaning';

  return {
    id: item.id,
    title: item.title || '',
    description,
    format,
    theme,
    perma,
    link: item.url || '#',
    image: '', // Image field not in schema - set to empty string
    guideWhy: description, // Use description/quote_text for guideWhy
    source: (item.source || 'feedboard') as 'feedboard' | 'guide' | 'manual',
    chips: [],
    guideComment: description, // Use subtitle/quote_text for guideComment
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
    // Set first item as hero (large display)
    const feedItems: FeedItem[] = (contentItems || []).map((item, index) => {
      const feedItem = mapContentItemToFeedItem(item);
      // Mark first item as hero to display it large
      if (index === 0) {
        feedItem.isHero = true;
      }
      return feedItem;
    });

    // Debug: Log cluster values from database (server-side)
    if (contentItems && contentItems.length > 0) {
      console.log('Feedboard API - Cluster values from DB:', {
        count: contentItems.length,
        clusters: contentItems.map(item => ({
          id: item.id,
          title: item.title,
          cluster: item.cluster,
          mapped_theme: feedItems.find(fi => fi.id === item.id)?.theme
        }))
      });
    }

    return NextResponse.json({ 
      items: feedItems,
      // Debug: Include original cluster values for inspection
      _debug: process.env.NODE_ENV === 'development' ? {
        originalClusters: contentItems?.map(item => ({
          id: item.id,
          title: item.title,
          cluster: item.cluster
        })) || []
      } : undefined
    });
  } catch (error) {
    console.error('Error in feedboard items API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

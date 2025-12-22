import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

interface ContentPreferences {
  user_id: string;
  formats?: {
    event?: boolean;
    quote?: boolean;
    article?: boolean;
    podcast?: boolean;
    video?: boolean;
    people?: boolean;
    song?: boolean;
  };
  clusters?: {
    time?: boolean;
    focus?: boolean;
    culture?: boolean;
    meaning?: boolean;
    relationships?: boolean;
    [key: string]: boolean | undefined;
  };
  max_articles_per_day?: number;
  max_podcasts_per_day?: number;
  max_quotes_per_day?: number;
  max_events_per_week?: number;
  updated_at?: string;
}

// Map frontend format names to database format names
const formatMap: Record<string, string> = {
  'Artikel': 'article',
  'Podcast': 'podcast',
  'Video': 'video',
  'Event': 'event',
  'Zitat': 'quote',
  'People': 'people',
  'Song': 'song',
};

const reverseFormatMap: Record<string, string> = {
  'article': 'Artikel',
  'podcast': 'Podcast',
  'video': 'Video',
  'event': 'Event',
  'quote': 'Zitat',
  'people': 'People',
  'song': 'Song',
};

// GET: Retrieve content preferences
export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get content preferences
    const { data: preferences, error: prefError } = await supabase
      .from('content_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle<ContentPreferences>();
    
    if (prefError && prefError.code !== 'PGRST116') {
      console.error('[Content Preferences] Error fetching:', prefError);
      return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 });
    }
    
    // Return defaults if no preferences exist
    if (!preferences) {
      return NextResponse.json({
        formatPreferences: {
          rank1: { format: 'Artikel', maxPerDay: 3 },
          rank2: { format: 'Podcast', maxPerDay: 4 },
          rank3: { format: 'Video', maxPerDay: 5 },
        },
      });
    }
    
    // Convert database format to frontend format
    // For now, we'll use the max_*_per_day fields to determine priority order
    // This is a simplified mapping - you might want to store priority order separately
    const formatPrefs = preferences.formats || {};
    const rank1Format = formatPrefs.article ? 'Artikel' : 
                        formatPrefs.podcast ? 'Podcast' : 
                        formatPrefs.video ? 'Video' : 'Artikel';
    const rank2Format = formatPrefs.podcast && rank1Format !== 'Podcast' ? 'Podcast' :
                        formatPrefs.video && rank1Format !== 'Video' ? 'Video' :
                        formatPrefs.article && rank1Format !== 'Artikel' ? 'Artikel' : 'Podcast';
    const rank3Format = formatPrefs.video && rank1Format !== 'Video' && rank2Format !== 'Video' ? 'Video' :
                        formatPrefs.podcast && rank1Format !== 'Podcast' && rank2Format !== 'Podcast' ? 'Podcast' :
                        'Video';
    
    return NextResponse.json({
      formatPreferences: {
        rank1: {
          format: rank1Format,
          maxPerDay: preferences.max_articles_per_day || 3,
        },
        rank2: {
          format: rank2Format,
          maxPerDay: preferences.max_podcasts_per_day || 4,
        },
        rank3: {
          format: rank3Format,
          maxPerDay: preferences.max_quotes_per_day || 5,
        },
      },
    });
  } catch (error) {
    console.error('[Content Preferences] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH: Update content preferences
export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    const { formatPreferences } = body;
    
    if (!formatPreferences) {
      return NextResponse.json({ error: 'formatPreferences required' }, { status: 400 });
    }
    
    // Convert frontend format names to database format names
    const dbFormat1 = formatMap[formatPreferences.rank1?.format] || 'article';
    const dbFormat2 = formatMap[formatPreferences.rank2?.format] || 'podcast';
    const dbFormat3 = formatMap[formatPreferences.rank3?.format] || 'video';
    
    // Build formats object
    const formats: Record<string, boolean> = {
      article: false,
      podcast: false,
      video: false,
      event: false,
      quote: false,
      people: false,
      song: false,
    };
    
    formats[dbFormat1] = true;
    formats[dbFormat2] = true;
    formats[dbFormat3] = true;
    
    // Map maxPerDay to the appropriate column based on format
    const updateData: Partial<ContentPreferences> = {
      formats: formats as any,
      updated_at: new Date().toISOString(),
    };
    
    // Set max_*_per_day based on format priority
    if (dbFormat1 === 'article') {
      updateData.max_articles_per_day = formatPreferences.rank1?.maxPerDay || 3;
    } else if (dbFormat1 === 'podcast') {
      updateData.max_podcasts_per_day = formatPreferences.rank1?.maxPerDay || 3;
    } else if (dbFormat1 === 'quote') {
      updateData.max_quotes_per_day = formatPreferences.rank1?.maxPerDay || 3;
    }
    
    if (dbFormat2 === 'article') {
      updateData.max_articles_per_day = formatPreferences.rank2?.maxPerDay || 4;
    } else if (dbFormat2 === 'podcast') {
      updateData.max_podcasts_per_day = formatPreferences.rank2?.maxPerDay || 4;
    } else if (dbFormat2 === 'quote') {
      updateData.max_quotes_per_day = formatPreferences.rank2?.maxPerDay || 4;
    }
    
    if (dbFormat3 === 'article') {
      updateData.max_articles_per_day = formatPreferences.rank3?.maxPerDay || 5;
    } else if (dbFormat3 === 'podcast') {
      updateData.max_podcasts_per_day = formatPreferences.rank3?.maxPerDay || 5;
    } else if (dbFormat3 === 'quote') {
      updateData.max_quotes_per_day = formatPreferences.rank3?.maxPerDay || 5;
    }
    
    // Use upsert to create or update
    const { data: updatedPrefs, error: updateError } = await supabase
      .from('content_preferences')
      .upsert({
        user_id: user.id,
        ...updateData,
      }, {
        onConflict: 'user_id',
      })
      .select()
      .single();
    
    if (updateError) {
      console.error('[Content Preferences] Update error:', updateError);
      return NextResponse.json(
        { error: updateError.message || 'Failed to update preferences' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      formatPreferences: {
        rank1: {
          format: formatPreferences.rank1?.format || 'Artikel',
          maxPerDay: formatPreferences.rank1?.maxPerDay || 3,
        },
        rank2: {
          format: formatPreferences.rank2?.format || 'Podcast',
          maxPerDay: formatPreferences.rank2?.maxPerDay || 4,
        },
        rank3: {
          format: formatPreferences.rank3?.format || 'Video',
          maxPerDay: formatPreferences.rank3?.maxPerDay || 5,
        },
      },
    });
  } catch (error) {
    console.error('[Content Preferences] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


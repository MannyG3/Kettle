import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Configure for Vercel Edge Functions
export const runtime = 'edge';

// Aggressive caching for heat data (revalidate every 10 seconds)
export const revalidate = 10;

function createEdgeSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  
  if (!url || !key) {
    throw new Error('Supabase not configured');
  }
  
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

interface KettleHeatData {
  kettle_id: string;
  total_heat: number;
  post_count: number;
  boiling_posts: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const kettleId = searchParams.get('kettleId');
    const kettleSlug = searchParams.get('slug');
    
    if (!kettleId && !kettleSlug) {
      return NextResponse.json(
        { error: 'Kettle ID or slug required' },
        { status: 400 }
      );
    }
    
    const supabase = createEdgeSupabaseClient();
    
    // If we have a slug, first get the kettle ID
    let resolvedKettleId = kettleId;
    if (!resolvedKettleId && kettleSlug) {
      const { data: kettle, error: kettleError } = await supabase
        .from('kettles')
        .select('id')
        .eq('slug', kettleSlug)
        .single();
      
      if (kettleError || !kettle) {
        return NextResponse.json(
          { error: 'Kettle not found' },
          { status: 404 }
        );
      }
      
      resolvedKettleId = kettle.id;
    }
    
    // Fetch aggregated heat data efficiently using a single query
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('heat_score')
      .eq('kettle_id', resolvedKettleId);
    
    if (postsError) {
      console.error('Fetch posts error:', postsError);
      return NextResponse.json(
        { error: 'Failed to fetch heat data' },
        { status: 500 }
      );
    }
    
    // Calculate heat metrics efficiently
    const heatData: KettleHeatData = {
      kettle_id: resolvedKettleId!,
      total_heat: 0,
      post_count: posts?.length ?? 0,
      boiling_posts: 0,
    };
    
    if (posts && posts.length > 0) {
      for (const post of posts) {
        const heat = post.heat_score ?? 0;
        heatData.total_heat += heat;
        if (heat >= 100) {
          heatData.boiling_posts++;
        }
      }
    }
    
    // Return with cache headers for Edge caching
    return NextResponse.json(heatData, {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
      },
    });
  } catch (error) {
    console.error('Kettle heat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

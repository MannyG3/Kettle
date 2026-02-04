import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Configure for Vercel Edge Functions
export const runtime = 'edge';

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

interface TrendingPost {
  id: string;
  content: string;
  heat_score: number;
  anonymous_identity: string;
  created_at: string;
  kettle_name: string;
  kettle_slug: string;
}

interface KettleWithHeat {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  total_heat: number;
  post_count: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'posts';
    const limit = Math.min(parseInt(searchParams.get('limit') || '5'), 20);
    
    const supabase = createEdgeSupabaseClient();
    
    if (type === 'kettles') {
      // Fetch trending kettles with heat
      const { data: kettlesData, error } = await supabase
        .from('kettles_with_heat')
        .select('*')
        .order('total_heat', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.error('Fetch kettles error:', error);
        return NextResponse.json(
          { error: 'Failed to fetch trending kettles' },
          { status: 500 }
        );
      }
      
      const kettles: KettleWithHeat[] = (kettlesData ?? []).map((k) => ({
        id: k.id,
        name: k.name,
        slug: k.slug,
        description: k.description,
        total_heat: k.total_heat ?? 0,
        post_count: k.post_count ?? 0,
      }));
      
      return NextResponse.json({ kettles }, {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      });
    }
    
    // Default: fetch trending posts
    const { data: postsData, error } = await supabase
      .from('trending_posts')
      .select('*')
      .limit(limit);
    
    if (error) {
      console.error('Fetch posts error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch trending posts' },
        { status: 500 }
      );
    }
    
    const posts: TrendingPost[] = (postsData ?? []).map((p) => ({
      id: p.id,
      content: p.content,
      heat_score: p.heat_score ?? 0,
      anonymous_identity: p.anonymous_identity ?? 'Anonymous Tea',
      created_at: p.created_at,
      kettle_name: p.kettle_name,
      kettle_slug: p.kettle_slug,
    }));
    
    return NextResponse.json({ posts }, {
      headers: {
        'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=45',
      },
    });
  } catch (error) {
    console.error('Trending API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Configure for Vercel Edge Functions
export const runtime = 'edge';

// Lightweight Supabase client for Edge - created per request
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

type VoteAction = 'up' | 'down' | 'remove-up' | 'remove-down';

interface VoteRequest {
  postId: string;
  action: VoteAction;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as VoteRequest;
    const { postId, action } = body;
    
    // Validate input
    if (!postId || typeof postId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid post ID' },
        { status: 400 }
      );
    }
    
    if (!['up', 'down', 'remove-up', 'remove-down'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }
    
    const supabase = createEdgeSupabaseClient();
    
    // Determine which RPC to call based on action
    let rpcName: string;
    switch (action) {
      case 'up':
        rpcName = 'increment_heat';
        break;
      case 'down':
      case 'remove-up':
        rpcName = 'decrement_heat';
        break;
      case 'remove-down':
        rpcName = 'increment_heat';
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
    
    const { data, error } = await supabase.rpc(rpcName, { post_id: postId });
    
    if (error) {
      console.error('Vote RPC error:', error);
      return NextResponse.json(
        { error: 'Failed to update heat' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      heat: data ?? 0,
    });
  } catch (error) {
    console.error('Vote API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint for fetching current heat score
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    
    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID required' },
        { status: 400 }
      );
    }
    
    const supabase = createEdgeSupabaseClient();
    
    const { data, error } = await supabase
      .from('posts')
      .select('heat_score')
      .eq('id', postId)
      .single();
    
    if (error) {
      console.error('Fetch heat error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch heat' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      heat: data?.heat_score ?? 0,
    });
  } catch (error) {
    console.error('Get heat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

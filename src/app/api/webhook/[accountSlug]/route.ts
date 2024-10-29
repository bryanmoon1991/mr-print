import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import RedisSingleton from '@/lib/redis/client';

export async function POST(
  request: Request,
  { params }: { params: { accountSlug: string } }
) {
  const { accountSlug } = params;
  const supabase = createClient();

  // Parse the request body
  const webhookData = await request.json();

  // Verify the user exists in the database
  //   const { data, error } = await supabase.rpc('get_account_by_slug')

  //   if (error || !user) {
  //     return NextResponse.json({ error: 'User not found' }, { status: 404 });
  //   }
  let message = await RedisSingleton.get('token')
  return NextResponse.json({ success: true, message });
}

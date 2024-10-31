import { NextResponse } from 'next/server';
// import RedisSingleton from '@/lib/redis/client';
import QueueManager from '@/lib/redis/qclient';

export async function POST(request: Request) {
  try {
    const clonedRequest = request.clone();
    // was experiencing issues calling request.json()
    // issue was most likely caused by middleware reading the request
    // Parse the JSON from the cloned request
    const webhookData = await clonedRequest.json();
    // const webhookData = await request.json();
    console.log('processed webhook', webhookData)

    // Use bracket notation to safely access fields in case of special characters in the keys
    const record = webhookData['record']; // Bracket notation for 'record'
    const accountId = record && record['account_id']; // Bracket notation for 'account_id'

    // Validate that 'account_id' is present
    if (!accountId) {
      return NextResponse.json({ success: false, message: 'Missing account_id in webhook data' }, { status: 400 });
    }

    // Add job to Redis and get the result (list length)
    const result = await QueueManager.addJob(accountId, record);

    // Check if the job was successfully added to the Redis list
    if (result > 0) {
      return NextResponse.json({ success: true, message: 'Job added to Redis' });
    } else {
      // If result is not > 0, something went wrong
      return NextResponse.json({ success: false, message: 'Failed to add job to Redis' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error processing webhook:', error.message, error.stack);

    // Return a 500 response in case of any unhandled error
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

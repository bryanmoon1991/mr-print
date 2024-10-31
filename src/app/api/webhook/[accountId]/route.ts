import { NextResponse } from 'next/server';
// import RedisSingleton from '@/lib/redis/client';
import QueueManager from '@/lib/redis/qclient';
import { generateEposXML } from '@/lib/utils';
import xml2js from 'xml2js';

export async function POST(
  request: Request,
  { params }: { params: { accountId: string } }
) {
  const { accountId } = params;
  const formData = await request.text();
  const urlParams = new URLSearchParams(formData);
  const webhookData: any = {};
  urlParams.forEach((value, key) => {
    webhookData[key] = value;
  });
  const httpRequest = webhookData?.ConnectionType;

  if (httpRequest === 'GetRequest') {
    console.log('in get request');
    try {
      const queue = await QueueManager.getJobs(accountId);
      if (queue.length > 0) {
        let response = generateEposXML(queue[0]);
        return new Response(response, {
          headers: {
            'Content-Type': 'text/xml; charset=UTF-8',
          },
          status: 200,
        });
      } else {
        return NextResponse.json(
          {
            message: 'No jobs in queue',
          },
          { status: 201 }
        );
      }
    } catch (error) {
      console.error('Error in get:', error);
      return NextResponse.json({ success: false }, { status: 400 });
    }
  } else if (httpRequest === 'SetResponse') {
    console.log('in set response');
    try {
      const queue = await QueueManager.getJobs(accountId);
      if (queue.length > 0) {
        const justPrinted = queue[0];
        console.log('justPrinted', justPrinted);
        const recordId = justPrinted['id'];
        console.log('recordID', recordId);
        const deletion = await QueueManager.removeJob(
          accountId,
          justPrinted,
          recordId
        );
        console.log('redis after delete', deletion);
      }
      return NextResponse.json({
        success: true,
        message: 'Processed print job successfully',
      });
    } catch (error) {
      console.error('Error:', error);
      return NextResponse.json(
        { success: false, message: 'Error processing print job' },
        { status: 500 }
      );
    }
  } else {
    return NextResponse.json(
      { success: false, message: 'Invalid connection type' },
      { status: 400 }
    );
  }
}

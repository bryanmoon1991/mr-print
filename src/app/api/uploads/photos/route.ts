import { createAdminClient } from '@/lib/supabase/client';
import { NextResponse } from 'next/server';
import { handleRequest } from 'better-upload/server';
 

export async function POST(request: Request) {
  const supabase = createAdminClient();
  return handleRequest(request, {
    // your router config...
  });

  try {
    // Read the binary data from the request
    const fileBuffer = await request.arrayBuffer();
    const contentType = request.headers.get('content-type');
    console.log('file', fileBuffer);
    console.log('content-type', contentType);
    console.log('headers', request.headers);

    // Check if the Content-Type is an image
    // if (!contentType || !contentType.startsWith('image/')) {
    //   return NextResponse.json({ error: 'Only image uploads are allowed' }, { status: 400 });
    // }

    // // Create a Blob with the image MIME type
    const file = new Blob([fileBuffer]);
    console.log('blob', file);

    // // Generate a unique file path
    // const uniqueFilePath = `photos/uploaded-image`;

    // // Upload the Blob to Supabase storage
    // const { data, error } = await supabase.storage
    //   .from('photos')
    //   .upload(uniqueFilePath, file);

    // if (error) {
    //   return NextResponse.json({ error: error.message }, { status: 500 });
    // }

    // return NextResponse.json({ data }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}

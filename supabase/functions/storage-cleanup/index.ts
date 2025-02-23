// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  const aWeekAgo = new Date();
  aWeekAgo.setDate(aWeekAgo.getDate() - 7);

  const url = Deno.env.get('SUPABASE_URL')!;
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(url, key);
  // 1. Fetch rows over 7 days old
  const { data: oldRows, error: fetchError } = await supabase
    .from('kiln_requests')
    .select()
    .lte('created_at', aWeekAgo.toISOString())
    // Ensure photo_url is not null
    .not('photo_url', 'is', null)
    // Also ensure it's not an empty string
    .neq('photo_url', '')
    .order('created_at', { ascending: true });

  if (fetchError) {
    console.error('Error fetching old rows:', fetchError);
    return new Response('Fetch error', { status: 500 });
  }

  // 2. Delete files from Storage and update DB
  if (oldRows && oldRows.length) {
    for (const row of oldRows) {
      console.log('Record', row);
      const bucketName = 'photos';
      let photoUrl = row.photo_url as string;
      console.log('URL', photoUrl);
      const objectName = photoUrl.split('/photos/').slice(-1)[0];
      console.log('FILENAME', objectName);

      // Delete the file from Storage
      const { data, error: storageDeleteError } = await supabase.storage
        .from(bucketName)
        .remove([objectName]);

      if (storageDeleteError) {
        console.error('Error deleting from storage:', storageDeleteError);
      }

      console.log('just deleted from:', data);
      console.log(`Deleted ${objectName} from ${bucketName}`);

      // Update the row in the DB to set photo_url = NULL
      if (data) {
        const { error: updateError } = await supabase
          .from('kiln_requests')
          .update({ photo_url: null })
          .eq('id', row.id);

        if (updateError) {
          console.error('Error updating photo_url to NULL:', updateError);
        }
      }
    }
  }

  return new Response('Cleanup done', { status: 200 });
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/storage-cleanup' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/

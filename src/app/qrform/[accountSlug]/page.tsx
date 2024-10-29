import KilnRequestForm from '@/components/user-facing/kiln-request-form';
import { createClient } from '@/lib/supabase/server';

export default async function QrFormPage({
  params: { accountSlug, accountId },
}: {
  children: React.ReactNode;
  params: { accountSlug: string, accountId: string };
}) {
  const supabaseClient = createClient();
  const { data, error } = await supabaseClient.rpc(
    'get_account_metadata_by_slug',
    { slug: accountSlug }
  );

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('HERE', data);
  }

  return (
    <div className='flex flex-col gap-y-8'>
      <KilnRequestForm metadata={data} />
    </div>
  );
}

import AfterForm from '@/components/user-facing/after-form'
import { createClient } from '@/lib/supabase/server';

export default async function QrFormCompletePage({
  params,
}: {
  params: { accountSlug: string; accountId: string };
}) {
  const { accountSlug, accountId } = params;
  // const supabaseClient = createClient();
  // const { data, error } = await supabaseClient.rpc(
  //   'get_account_metadata_by_slug',
  //   { slug: accountSlug }
  // );

  // if (error) {
  //   console.error('Error with get_account_metadata_by_slug:', accountSlug, error);
  // } 

  return (
    <div className='flex flex-col gap-y-8'>
      <AfterForm />
    </div>
  );
}

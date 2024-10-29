import { createClient } from '@/lib/supabase/server';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './kilnRequests'

export default async function PrintJobsPage({
  params: { accountSlug },
}: {
  params: { accountSlug: string };
}) {
  const supabaseClient = createClient();
//   const { data: teamAccount } = await supabaseClient.rpc(
//     'get_account_by_slug',
//     {
//       slug: accountSlug,
//     }
//   );
  let { data: kiln_requests, error } = await supabaseClient
    .from('kiln_requests')
    .select('*')
    .range(0, 20);

  console.log('here', kiln_requests);
  return (
    <div className='container mx-auto'>
      {kiln_requests && <DataTable columns={columns} data={kiln_requests} />}
    </div>
  );
}

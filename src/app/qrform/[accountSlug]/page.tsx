import KilnRequestForm from '@/components/user-facing/kiln-request-form';
import { createClient } from '@/lib/supabase/server';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default async function QrFormPage({
  params: { accountSlug },
  searchParams: { accountId },
}: {
  children: React.ReactNode;
  params: { accountSlug: string };
  searchParams: { accountId?: string };
}) {
  const supabaseClient = createClient();
  const { data, error } = await supabaseClient.rpc(
    'get_account_metadata_by_slug',
    { slug: accountSlug }
  );

  if (error) {
    console.error('Error:', error);
  } 

  const billingStatus = await supabaseClient.rpc('get_subscription_status', {
    account_id_input: accountId,
  });

  return (
    <div className='flex flex-col gap-y-8'>
      {billingStatus.data === 'active' ? (
        error ? (
          <Alert variant='destructive'>
            <AlertTitle>There was a problem fetching the form!</AlertTitle>
            <AlertDescription>
              Try reloading the page. If the problem persists, please notify the
              studio manager and fill out a manual slip in the meantime!
              <br />
              {error.message}
            </AlertDescription>
          </Alert>
        ) : (
          <KilnRequestForm metadata={data} />
        )
      ) : (
        <div className='flex items-center justify-center h-96'>
          <div className='flex flex-col items-center gap-y-4'>
            <Alert variant='destructive'>
              <AlertTitle>
                There is a problem with the studio's subscription!
              </AlertTitle>
              <AlertDescription>
                Please alert the studio manager to reactivate their Mr.Print
                subscription.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )}
    </div>
  );
}

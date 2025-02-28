import { createClient } from '@/lib/supabase/server';
import DashboardHeader from '@/components/dashboard/dashboard-header';
import { redirect } from 'next/navigation';
import TeamAccountProvider from './teamAccountProvider';

export default async function TeamAccountLayout({
  children,
  params: { accountSlug },
}: {
  children: React.ReactNode;
  params: { accountSlug: string };
}) {
  const supabaseClient = createClient();

  const { data: teamAccount, error } = await supabaseClient.rpc(
    'get_account_by_slug',
    {
      slug: accountSlug,
    }
  );

  if (!teamAccount) {
    redirect('/dashboard');
  }

  const navigation = [
    {
      name: 'Overview',
      href: `/dashboard/${accountSlug}`,
    },
    {
      name: 'Kiln Requests',
      href: `/dashboard/${accountSlug}/kilnrequests`,
    },
    {
      name: 'Settings',
      href: `/dashboard/${accountSlug}/settings`,
    },
  ];

  return (
    <>
      <DashboardHeader
        accountId={teamAccount.account_id}
        navigation={navigation}
      />
      <TeamAccountProvider teamAccount={teamAccount}>
        <div className='w-full p-8'>{children}</div>
      </TeamAccountProvider>
    </>
  );
}

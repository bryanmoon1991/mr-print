import React from 'react';
import { createClient } from '@/lib/supabase/server';
import DashboardHeader from '@/components/dashboard/dashboard-header';
import { redirect } from 'next/navigation';

export default async function TeamAccountLayout({
  children,
  // params: { accountSlug },
}: {
  children: React.ReactNode;
  // params: { accountSlug: string };
}) {
  // const supabaseClient = createClient();
  // const { data, error } = await supabaseClient.rpc(
  //   'get_account_metadata_by_slug',
  //   { slug: accountSlug }
  // );
  
  // if (error) {
  //   console.error('Error:', error);
  // } else {
  //   console.log('HERE', data);
  // }


  // console.log('HERE', data)


  // if (!teamAccount) {
  //   redirect('/dashboard');
  // }

  return (
    <>
      {/* <DashboardHeader
        accountId={teamAccount.account_id}
        navigation={navigation}
      /> */}
      <div className='w-full p-8'>{children}</div>
    </>
  );
}

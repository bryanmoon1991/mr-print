import EditTeamName from '@/components/basejump/edit-team-name';
import CopyLink from '@/components/team-settings/copy-link';
import EditTeamMetadata from '@/components/team-settings/edit-team-metadata';
import { createClient } from '@/lib/supabase/server';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

import QRCode from 'qrcode';

export default async function TeamSettingsPage({
  params: { accountSlug },
}: {
  params: { accountSlug: string };
}) {
  const supabaseClient = createClient();
  const { data: teamAccount } = await supabaseClient.rpc(
    'get_account_by_slug',
    {
      slug: accountSlug,
    }
  );
  const { data, error } = await supabaseClient.functions.invoke(
    'billing-functions',
    {
      body: {
        action: 'get_billing_status',
        args: {
          account_id: teamAccount.account_id,
        },
      },
    }
  );
  if (error) {
    console.error('Error fetching billing status: ', error);
    console.error('For: ', accountSlug, teamAccount.account_id);
  }
  const accountStatus = data.status;

  const generateQRCode = async (text: string) => {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(text);
      return qrCodeDataUrl;
    } catch (error) {
      console.error('Error generating QR Code: ', error);
    }
  };

  return (
    <div className='flex flex-col gap-y-8'>
      {accountStatus === 'active' ? (
        <>
          <EditTeamName account={teamAccount} />
          <EditTeamMetadata account={teamAccount} />
          <Card>
            <CardHeader>
              <CardTitle>Webhook URL</CardTitle>
              <CardDescription>
                Save this URL to your Server Direct Printer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CopyLink teamAccount={teamAccount} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Qr Code</CardTitle>
              <CardDescription>
                Click to download! Print the QR code for users to scan & fill
                out form!
              </CardDescription>
            </CardHeader>
            <CardContent className='flex items-center'>
              <a
                href={await generateQRCode(
                  process.env.NEXT_PUBLIC_URL +
                    `/qrform/${accountSlug}?accountId=${teamAccount.account_id}`
                )}
                download={`${accountSlug}_qrcode.png`}
                className='border border-transparent rounded-md hover:border-primary hover:border-4'
              >
                <img
                  src={await generateQRCode(
                    process.env.NEXT_PUBLIC_URL +
                      `/qrform/${accountSlug}?accountId=${teamAccount.account_id}`
                  )}
                  alt='qr_code'
                />
              </a>
            </CardContent>
          </Card>
        </>
      ) : (
        <Alert>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Heads up!</AlertTitle>
          <AlertDescription>
            Access to this page requires an active subscription. Please note
            that the printer will also be inoperable without an active
            subscription. To update your subscription, visit the Billing
            section.{' '}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

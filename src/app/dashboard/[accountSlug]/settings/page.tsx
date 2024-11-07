import EditTeamName from '@/components/basejump/edit-team-name';
import EditTeamSlug from '@/components/basejump/edit-team-slug';
import CopyLink from '@/components/team-settings/copy-link'
import EditTeamMetadata from '@/components/team-settings/edit-team-metadata';
import { createClient } from '@/lib/supabase/server';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Download } from 'lucide-react';
import { toast } from 'sonner';
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

  const generateQRCode = async (text) => {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(text);
      return qrCodeDataUrl;
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className='flex flex-col gap-y-8'>
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
            Click to download! Print the QR code for users to scan & fill out
            form!
          </CardDescription>
        </CardHeader>
        <CardContent className='flex items-center'>
          <a
            href={await generateQRCode(
              process.env.NEXT_PUBLIC_URL +
                `/qrform/${accountSlug}?accountId=${teamAccount.account_id}`
            )}
            download={`${accountSlug}_qrcode.png`}
            className="border border-transparent rounded-md hover:border-primary hover:border-4"
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
    </div>
  );
}

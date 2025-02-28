'use client';

import { Copy } from 'lucide-react'; 
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner'
import type { Account } from '../../../types/data-table';

interface CopyLinkProps {
  teamAccount: Account;
}

export default function CopyLink({teamAccount}: CopyLinkProps) {
  const handleCopyClick = () => {
    navigator.clipboard
      .writeText(
        process.env.NEXT_PUBLIC_URL + `/api/webhook/${teamAccount.account_id}`
      )
      .then(() => {
        toast.success('URL copied to clipboard!');
      })
      .catch((error) => {
        toast.error('Failed to copy URL!', { description: error.message });
      });
  };

  return (
    <div className='flex items-center space-x-2'>
      <div className='grid flex-1 gap-2'>
        <Label htmlFor='link' className='sr-only'>
          Link
        </Label>
        <Input
          id='link'
          defaultValue={
            process.env.NEXT_PUBLIC_URL +
            `/api/webhook/${teamAccount.account_id}`
          }
          readOnly
        />
      </div>
      <Button type='button' size='sm' className='px-3' onClick={handleCopyClick}>
        <span className='sr-only'>Copy</span>
        <Copy />
      </Button>
    </div>
  );
}

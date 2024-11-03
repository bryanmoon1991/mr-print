'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import { createClient } from '@/lib/supabase/client';
import { checkForDuplicate, reprint } from '@/lib/actions/print-requests';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

type Record = {
  id: string;
  account_id: string;
  first_name: string;
  last_name: string;
  opt_in: boolean | null;
  length: number;
  width: number;
  height: number;
  quantity: number;
  cost: string;
  firing_type: string;
  non_member: boolean | null;
  photo_url: string | null;
  printed: boolean;
  exported: boolean;
  updated_at: string | Date;
  created_at: string | Date;
  updated_by: string | null;
  created_by: string | null;
  email: string | null;
};


export default function AfterForm() {
  const { accountSlug } = useParams();
  const searchParams = useSearchParams();
  const [accountId, setAccountId] = useState<string>('');
  const [recordId, setRecordId] = useState<string>('');
  const [record, setRecord] = useState<null | Record>(null);
  const [isOpen, setIsOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const accId = searchParams.get('accountId');
    if (accId) {
      setAccountId(accId);
    }
    const recId = searchParams.get('recordId');
    if (recId) {
      setRecordId(recId);
    }
  }, [searchParams]);

  useEffect(() => {
    if (recordId) {
      // Convert fetchRecord to a function expression
      const fetchRecord = async () => {
        const { data, error } = await supabase
          .from('kiln_requests')
          .select('*')
          .eq('id', recordId)
          .single();

        if (error) {
          console.error('Error fetching record:', error);
        } else {
          console.log('fetched', data);
          setRecord(data);
        }
      };

      fetchRecord();
    }
  }, [recordId]);

  const handleReprint = async () => {
    if (!record && !accountId) return;
    const check = await checkForDuplicate(accountId, record);
    // check ? setIsOpen(true) : await reprint(accountId, record)
    if (check) {
      setIsOpen(true);
    } else {
      const reprintResult = await reprint(accountId, record);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Thank You!</CardTitle>
          <CardDescription>
            Please check back in a few weeks to pick up your fired piece!
          </CardDescription>
        </CardHeader>
        <CardContent>
          {record ? (
            <>
              <p>Just Printed:</p>
              <ul>
                <li><strong>Name:</strong> {record.first_name + " " + record.last_name}</li>
                <li><strong>Date:</strong> {new Date(record.created_at).toLocaleString()}</li>
                <li><strong>Dimensions:</strong> {record.length + "in x " + record.width + "in x " + record.height + "in"}</li>
                <li><strong>Quantity:</strong> {record.quantity}</li>
                <li><strong>Cost:</strong> {record.cost}</li>
                {record.photo_url && <li><strong>Photo:</strong> 
                  <img src={record.photo_url} alt="image of student piece"/>
                </li>}
              </ul>
            </>
          ) : (
            <Loader2 />
          )}
        </CardContent>
        <CardFooter className='gap-2'>
          <Button onClick={handleReprint}>Reprint</Button>
          <Link href={`/qrform/${accountSlug}?accountId=${accountId}`}>
            <Button>Fire Another Piece</Button>
          </Link>
        </CardFooter>
      </Card>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hold up!</DialogTitle>
            <DialogDescription>
                We noticed a duplicate request waiting to be printed. If you
                havent received your receipt, please check the printer for:
              <br/>
              <br/>
              <li>power</li>
              <li>wifi</li>
              <li>paper</li>
              <br/>
                If the printer seems to be in working order and requests are
                still not going through, please notify the manager onsite and
                we'll work to get this issue resolved asap!
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}

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

export default function AfterForm() {
  const { accountSlug } = useParams();
  const searchParams = useSearchParams();
  const [accountId, setAccountId] = useState<string | null>(null);

  useEffect(() => {
    const id = searchParams.get('accountId');
    if (id) {
      setAccountId(id);
    }
  }, [searchParams]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thank You!</CardTitle>
        {/* <CardDescription>Kiln Request Form</CardDescription> */}
      </CardHeader>
      <CardContent className='flex flex-col gap-y-6'>
        <div className='flex flex-col items-start gap-y-4'>
          <p>Please check back in a few weeks to pick up your fired piece!</p>
        </div>
      </CardContent>
      <CardFooter className='text-center'>
        <Link href={`/qrform/${accountSlug}?accountId=${accountId}`}>
          <Button>Fire Another Piece</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

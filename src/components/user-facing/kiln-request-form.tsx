'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Label } from '../ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { SubmitButton } from '../ui/submit-button';
import { addKilnRequest } from '@/lib/actions/teams';
import { Checkbox } from '../ui/checkbox';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';

interface Metadata {
  opt_in: {
    required: boolean;
  };
  member_cost: number;
  non_member_cost: number;
  firing_types: string[];
}

interface FormProps {
  metadata: Metadata;
}

export default function KilnRequestForm({ metadata }: FormProps) {
  const { accountSlug } = useParams();
  const searchParams = useSearchParams();
  const [accountId, setAccountId] = useState<string | null>(null);

  useEffect(() => {
    const id = searchParams.get('accountId');
    if (id) {
      setAccountId(id);
    }
  }, [searchParams]);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [optIn, setOptIn] = useState(false);
  const [length, setLength] = useState(0);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [nonMember, setNonMember] = useState(false);
  const [firingType, setFiringType] = useState(metadata.firing_types[0]);
  const [photoUrl, setPhotoUrl] = useState('');
  const [cost, setCost] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const baseCost = length * width * height;
    const unitCost = nonMember
      ? metadata.non_member_cost
      : metadata.member_cost;
    setCost(baseCost * unitCost * quantity);
  }, [length, width, height, quantity, nonMember, metadata]);

  const handleOptInChecked = (checked: boolean) => {
    setOptIn(checked)
  }

  const handleNonMemberChecked = (checked: boolean) => {
    setNonMember(checked)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fire a Piece!</CardTitle>
        <CardDescription>Kiln Request Form</CardDescription>
      </CardHeader>
      {message && <p>{message}</p>}
      <form
        className='animate-in flex-1 text-foreground'
      >
        <input type='hidden' name='slug' value={accountSlug} />
        <input type='hidden' name='accountId' value={accountId || ""} />
        <CardContent className='flex flex-col gap-y-6'>
          <div className='flex flex-col items-start gap-y-4'>
            <Label htmlFor='first_name'>First Name</Label>
            <Input
              type='text'
              id='first_name'
              name='first_name'
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />

            <Label htmlFor='last_name'>Last Name</Label>
            <Input
              type='text'
              id='last_name'
              name='last_name'
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />

            {metadata.opt_in.required && (
              <div className='flex items-center space-x-2'>
                <Label
                  htmlFor='opt_in'
                  className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                >
                  Opt-in
                </Label>
                <Checkbox
                  id='opt_in'
                  name='opt_in'
                  checked={optIn}
                  onCheckedChange={handleOptInChecked}
                />
              </div>
            )}

            <Label htmlFor='length'>Length</Label>
            <Input
              type='number'
              id='length'
              name='length'
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              required
            />

            <Label htmlFor='width'>Width</Label>
            <Input
              type='number'
              id='width'
              name='width'
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              required
            />

            <Label htmlFor='height'>Height</Label>
            <Input
              type='number'
              id='height'
              name='height'
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              required
            />

            <Label htmlFor='quantity'>Quantity</Label>
            <Input
              type='number'
              id='quantity'
              name='quantity'
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              min={1}
              required
            />

            <div className='flex flex-col gap-y-2'>
              <Label htmlFor='firing_type'>Firing Type</Label>
              <Select
                value={firingType}
                onValueChange={setFiringType}
                name='firing_type'
              >
                <SelectTrigger>
                  <SelectValue placeholder='Firing type' />
                </SelectTrigger>
                <SelectContent>
                  {metadata.firing_types.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='flex items-center space-x-2'>
              <Label
                htmlFor='non_member'
                className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
              >
                Non-Member
              </Label>
              <Checkbox
                id='non_member'
                name='non_member'
                checked={nonMember}
                onCheckedChange={handleNonMemberChecked}
              />
            </div>

            <Label htmlFor='photo_url'>Photo URL</Label>
            <Input
              type='text'
              id='photo_url'
              name='photo_url'
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
            />

            <Label htmlFor='cost'>Cost</Label>
            <Input type='number' id='cost' name='cost' value={cost} readOnly />
          </div>
        </CardContent>
        <CardFooter>
          <SubmitButton formAction={addKilnRequest} pendingText='Submitting...'>
            Add Item
          </SubmitButton>
        </CardFooter>
      </form>
    </Card>
  );
}

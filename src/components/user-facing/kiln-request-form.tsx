'use client';

import { createClient } from '@/lib/supabase/client';
import { useParams, useSearchParams } from 'next/navigation';
import { useId, useRef, useState, useEffect } from 'react';
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
import { Button } from '../ui/button';
import { Upload, Loader2, X, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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
  const supabase = createClient();
  const { accountSlug } = useParams();
  const searchParams = useSearchParams();
  const id = useId();
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
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState('');

  useEffect(() => {
    const baseCost = length * width * height;
    const unitCost = nonMember
      ? metadata.non_member_cost
      : metadata.member_cost;
    setCost(baseCost * unitCost * quantity);
  }, [length, width, height, quantity, nonMember, metadata]);

  const handleOptInChecked = (checked: boolean) => {
    setOptIn(checked);
  };

  const handleNonMemberChecked = (checked: boolean) => {
    setNonMember(checked);
  };

  const handleUpload = async (file) => {
    if (!file) return;

    setUploading(true);
    setError('');
    const fileName = `${accountId}_${firstName}_${lastName}-${file.name}`; // Create a unique filename
    console.log(fileName);
    const { data, error } = await supabase.storage
      .from('photos') // replace 'photos' with your bucket name
      .upload(fileName, file);

    if (error) {
      setError(error.message);
      console.error('Error uploading file:', error.message);
    } else {
      console.log('after upload', data);
      if (data.fullPath) {
        setPhotoUrl(process.env.NEXT_PUBLIC_PUBLIC_S3_URL! + data.fullPath);
        setUploaded(data.path);
      }
      console.log('File uploaded successfully:', data);
    }
    setUploading(false);
  };

  const handleDelete = async () => {
    if (!uploaded) return;
    let { data, error } = await supabase.storage
      .from('photos')
      .remove([uploaded]);

    if (error) {
      setError(error.message);
      console.error('Error deleting file:', error.message);
    } else {
      if (data[0]['name'] == uploaded) {
        setUploaded('');
        setPhotoUrl('');
        setError('');
      }
      console.log('File deleted successfully:', data);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fire a Piece!</CardTitle>
        <CardDescription>Kiln Request Form</CardDescription>
      </CardHeader>
      {/* {message && <p>{message}</p>} */}
      <form className='animate-in flex-1 text-foreground'>
        <input type='hidden' name='slug' value={accountSlug} />
        <input type='hidden' name='accountId' value={accountId || ''} />
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
            <div>
              {/* <Label htmlFor='photo_url'>Photo</Label> */}
              <Input
                type='hidden'
                id='photo_url'
                name='photo_url'
                value={photoUrl}
                // onChange={(e) => setPhotoUrl(e.target.value)}
              />
                <Button disabled={uploading} className='relative mb-4' type='button'>
                  <label
                    htmlFor={id}
                    className='absolute inset-0 cursor-pointer'
                  >
                    <input
                      id={id}
                      className='absolute inset-0 size-0 opacity-0'
                      type='file'
                      accept='image/*'
                      capture='environment'
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleUpload(e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                  {uploading ? (
                    <>
                      <Loader2 className='mr-2 size-4 animate-spin' />
                      Upload Photo
                    </>
                  ) : (
                    <>
                      <Upload className='mr-2 size-4' />
                      Upload Photo
                    </>
                  )}
                </Button>
                {error && (
                  <Alert className='border-red-400'>
                    <AlertCircle className='h-4 w-4' color='red' />
                    <AlertTitle>Error!</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {uploaded && photoUrl && (
                  <div className='max-w-[60%] h-auto relative self-center'>
                    <X
                      className='absolute top-0 right-0 cursor-pointer'
                      onClick={handleDelete}
                    />
                    <img
                      src={photoUrl}
                      alt={uploaded}
                      className='w-auto h-auto'
                    />
                  </div>
                )}
            </div>

            <Label htmlFor='cost'>Cost</Label>
            <Input type='number' id='cost' name='cost' value={cost} readOnly />
          </div>
        </CardContent>
        <CardFooter className='text-right'>
          <SubmitButton formAction={addKilnRequest} pendingText='Submitting...'>
            Add Item
          </SubmitButton>
        </CardFooter>
      </form>
    </Card>
  );
}

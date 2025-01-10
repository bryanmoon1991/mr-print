'use client';

import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { SubmitButton } from '../ui/submit-button';
import { Button } from '../ui/button';
import { Upload, Loader2, X, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { editTeamMetadata } from '@/lib/actions/teams';
import { Label } from '../ui/label';
import { Switch } from '@/components/ui/switch';
import { GetAccountResponse } from '@usebasejump/shared';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';

import { Cost, Metadata } from '@/../types/data-table';

import { Textarea } from '../ui/textarea';
import { v4 as uuidv4 } from 'uuid';

type Props = {
  account: GetAccountResponse;
};

interface UploadResponse {
  id: string;
  path: string;
  fullPath: string;
}

export default function EditTeamMetadata({ account }: Props) {
  const supabase = createClient();
  const [optIn, setOptIn] = useState<boolean>(
    account?.metadata?.opt_in?.required || false
  );
  const [formData, setFormData] = useState<Metadata>(
    account.metadata as Metadata
  );
  const [photoUrl, setPhotoUrl] = useState(
    account?.metadata?.logo?.logo_url || ''
  );
  const [uploaded, setUploaded] = useState(
    account?.metadata?.logo?.filename || ''
  );
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleUpload = async (file: File) => {
    // if a user uploads a photo and does not click save, the following data does not get written to metadata
    // was considering doing a write to metadata every time handleUpload and handleDelete are called to keep metadata in sync with storage data
    // instead i will make a unique path for the storage photo so that loading in photo works every time
    if (!file) return;

    setUploading(true);
    setError('');

    const fileName = `${account.account_id}_${uuidv4()}_${file.name}`; // Create a unique filename
    const { data, error } = (await supabase.storage
      .from('logos')
      .upload(fileName, file)) as { data: UploadResponse | null; error: Error };

    if (error) {
      setError(error.message);
      console.error('Error uploading LOGO file:', error.message);
    } else {
      //   {
      //     "path": "0681ac17-aedd-458a-a989-b8c3366d2ead-yaro.png",
      //     "id": "4a3ed275-153d-4592-9ac5-7fc4f0eda8e0",
      //     "fullPath": "logos/0681ac17-aedd-458a-a989-b8c3366d2ead-yaro.png"
      //   }
      if (data && data.fullPath) {
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
      .from('logos')
      .remove([uploaded]);

    if (error) {
      setError(error.message);
      console.error('Error deleting LOGO file:', error.message);
    } else {
      if (data && data[0]['name'] == uploaded) {
        setUploaded('');
        setPhotoUrl('');
        setError('');
      }
      console.log('LOGO file deleted successfully:', data);
    }
  };

  const orderedKeys: (keyof Metadata)[] = [
    'logo',
    'member_cost',
    'non_member_cost',
    'costs',
    'minimum_cost',
    'firing_types',
    'opt_in',
    'terms_and_conditions',
  ];

  const generateFormFields = (data: Metadata) => {
    return orderedKeys.map((key) => {
      const value = data[key];
      const labelText = key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());

      if (key === 'terms_and_conditions') {
        return (
          <div key={key} className='flex flex-col gap-1'>
            <Label htmlFor={key}>{labelText}</Label>
            <Textarea
              defaultValue={value as string}
              name={key}
              placeholder={labelText}
              className='resize-none'
              onChange={(e) => handleChange(e)}
            />
          </div>
        );
      } else if (key === 'logo') {
        return (
          <div key={key}>
            {/* <Label htmlFor='photo_url'>Photo</Label> */}
            <Input
              type='hidden'
              id='logo_url'
              name='logo_url'
              value={photoUrl}
              // onChange={(e) => setPhotoUrl(e.target.value)}
            />
            <Input
              type='hidden'
              id='filename'
              name='filename'
              value={uploaded}
              // onChange={(e) => setPhotoUrl(e.target.value)}
            />
            <Button
              disabled={uploading}
              className='relative mb-4'
              type='button'
            >
              <label
                htmlFor='uploader'
                className='absolute inset-0 cursor-pointer'
              >
                <input
                  id='uploader'
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
                  Upload Logo
                </>
              ) : (
                <>
                  <Upload className='mr-2 size-4' />
                  Upload Logo
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
              <div className='h-auto relative self-center'>
                <X
                  className='absolute top-0 right-0 cursor-pointer'
                  onClick={handleDelete}
                />
                <img src={photoUrl} alt={uploaded} className='w-auto h-auto' />
              </div>
            )}
          </div>
        );
      } else if (key === 'opt_in') {
        return (
          <div key={key} className='flex gap-4'>
            <Label className='self-center' htmlFor={key}>
              {labelText} Required?
            </Label>
            {typeof value === 'object' &&
              value !== null &&
              'required' in value && (
                <Switch
                  name={key}
                  checked={value.required}
                  onCheckedChange={(val) =>
                    handleOptInChange(key as keyof Metadata, val)
                  }
                />
              )}
            {/* <input name={key} type='hidden' value={String(optIn)} /> */}
          </div>
        );
      } else if (
        key === 'member_cost' ||
        key === 'non_member_cost' ||
        key === 'minimum_cost'
      ) {
        return (
          <div key={key} className='flex flex-col gap-1'>
            <Label htmlFor={key}>{labelText}</Label>
            <Input
              type='number'
              defaultValue={value as number}
              step='0.01'
              min='0'
              name={key}
              placeholder={labelText}
              onChange={(e) => handleNumberChange(e)}
            />
          </div>
        );
      } else if (typeof value === 'string') {
        return (
          <div key={key} className='flex flex-col gap-1'>
            <Label htmlFor={key}>{labelText}</Label>
            <Input
              defaultValue={value}
              name={key}
              placeholder={labelText}
              onChange={(e) => handleChange(e)}
            />
          </div>
        );
        // } else if (Array.isArray(value)) {
      } else if (key === 'costs' && Array.isArray(value)) {
        return (
          <div key={key} className='flex flex-col gap-1'>
            {/* <Label>{labelText}</Label> */}
            {value.map((cost, index) => (
              <div key={`${key}-${index}`} className='flex gap-1'>
                <div className='grid w-full max-w-sm items-start gap-1.5'>
                  <Label htmlFor={`cost_name-${index}`}>Cost Name</Label>
                  <Input
                    defaultValue={(cost as Cost).cost_name}
                    name={`cost_name-${index}`}
                    onChange={(e) =>
                      handleCostChange(index, 'cost_name', e.target.value)
                    }
                  />
                </div>

                {/* base_cost input */}
                <div className='grid w-full max-w-sm items-start gap-1.5'>
                  <Label htmlFor={`base_cost-${index}`}>Base Cost</Label>
                  <Input
                    type='number'
                    step='0.01'
                    min='0'
                    defaultValue={(cost as Cost).base_cost}
                    name={`base_cost-${index}`}
                    onChange={(e) =>
                      handleCostChange(index, 'base_cost', e.target.value)
                    }
                  />
                </div>

                {/* enforce_minimum checkbox */}

                <div className='grid max-w-sm items-start gap-1.5'>
                  <Label
                    htmlFor={`enforce_minimum-${index}`}
                    className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 whitespace-nowrap'
                  >
                    Enforce Minimum
                  </Label>
                  <Checkbox
                    name={`enforce_minimum-${index}`}
                    checked={(cost as Cost).enforce_minimum}
                    onCheckedChange={(e) =>
                      handleCostChange(index, 'enforce_minimum', e)
                    }
                  />
                </div>
                <X
                  type='button'
                  className='flex-none cursor-pointer self-center'
                  onClick={() => removeArrayItem(key as keyof Metadata, index)}
                />
              </div>
            ))}
            <Button
              variant='default'
              onClick={(e) => handleAddArrayItem(e, key as keyof Metadata)}
            >
              Add {labelText}
            </Button>
          </div>
        );
      } else if (key === 'firing_types' && Array.isArray(value)) {
        return (
          <div key={key} className='flex flex-col gap-1'>
            <Label>{labelText}</Label>
            {value.map((item, index) => (
              <div key={`${key}-${index}`} className='flex gap-1'>
                <Input
                  defaultValue={item as string}
                  name={`${key}-${index}`}
                  onChange={(e) =>
                    handleArrayChange(
                      key as keyof Metadata,
                      e.target.value,
                      index
                    )
                  }
                />
                <X
                  type='button'
                  className='cursor-pointer self-center'
                  onClick={() => removeArrayItem(key as keyof Metadata, index)}
                />
              </div>
            ))}
            <Button
              variant='default'
              onClick={(e) => handleAddArrayItem(e, key as keyof Metadata)}
            >
              Add {labelText}
            </Button>
          </div>
        );
      }

      return null;
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleArrayChange = (
    key: keyof Metadata,
    value: string,
    index?: number
  ) => {
    if (index !== undefined) {
      setFormData((prevData) => ({
        ...prevData,
        [key]: (prevData[key] as string[]).map((item, i) =>
          i === index ? value : item
        ),
      }));
    }
  };

  useEffect(() => {
    console.log(formData);
  }, [formData]);

  const handleCostChange = (
    index: number,
    field: keyof Cost,
    value: string | number | boolean
  ) => {
    setFormData((prevData) => ({
      ...prevData,
      costs: prevData.costs.map((cost, i) => {
        if (i === index) {
          return {
            ...cost,
            [field]:
              field === 'base_cost' ? parseFloat(value as string) || 0 : value, // parseFloat for numbers, direct assignment otherwise
          };
        }
        return cost;
      }),
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Ensure the input is valid number or empty string
    const numberValue = value === '' ? 0 : parseFloat(value);
    if (!isNaN(numberValue) || value === '') {
      setFormData((prevData) => ({
        ...prevData,
        [name]: numberValue,
      }));
    }
  };

  const handleOptInChange = (key: keyof Metadata, value: boolean) => {
    setOptIn(value);
    setFormData((prevData) => ({
      ...prevData,
      [key]: {
        required: value,
      },
    }));
  };

  const removeArrayItem = (key: keyof Metadata, index: number) => {
    setFormData((prevData) => ({
      ...prevData,
      [key]: (prevData[key] as string[]).filter((_, i) => i !== index),
    }));
  };

  // const addArrayItem = (key: keyof Metadata) => {
  //   setFormData((prevData) => ({
  //     ...prevData,
  //     [key]: [...(prevData[key] as string[]), ''], // Add an empty string initially
  //   }));
  // };

  // const handleAddArrayItem = (e: React.MouseEvent, key: keyof Metadata) => {
  //   e.preventDefault();
  //   addArrayItem(key);
  // };

  const handleAddArrayItem = (e: React.MouseEvent, key: keyof Metadata) => {
    e.preventDefault();
    setFormData((prevData) => {
      if (key === 'costs') {
        // Add a new Cost item with default values
        const newCost: Cost = {
          base_cost: 0.0,
          cost_name: 'New Cost',
          enforce_minimum: false,
        };
        return {
          ...prevData,
          costs: [...(prevData.costs ?? []), newCost],
        };
      } else {
        // Fallback behavior for other array fields, e.g. firing_types, which might just add an empty string
        return {
          ...prevData,
          [key]: [...(prevData[key] as string[]), ''],
        };
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Metadata</CardTitle>
        <CardDescription>Kiln Request Form Options</CardDescription>
      </CardHeader>
      <form className='animate-in flex-1 text-foreground'>
        <input type='hidden' name='accountId' value={account.account_id} />
        <CardContent className='flex flex-col gap-y-6'>
          <div className='flex flex-col gap-y-6'>
            {generateFormFields(formData)}
          </div>
        </CardContent>
        <CardFooter>
          <SubmitButton formAction={editTeamMetadata} pendingText='Updating...'>
            Save
          </SubmitButton>
        </CardFooter>
      </form>
    </Card>
  );
}

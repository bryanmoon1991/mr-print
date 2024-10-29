'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { SubmitButton } from '../ui/submit-button';
import { editTeamMetadata } from '@/lib/actions/teams';
import { Label } from '../ui/label';
import { GetAccountResponse } from '@usebasejump/shared';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';

type Props = {
  account: GetAccountResponse;
};

type ExtendedProps = Props & {
  member_cost: number;
  non_member_cost: number;
  terms_and_conditions: string;
  firing_types: string[];
};

export interface Metadata {
  member_cost: number;
  non_member_cost: number;
  firing_types: string[];
  opt_in: {
    required: boolean;
  };
  terms_and_conditions: string;
}

export default function EditTeamMetadata({ account }: Props) {
  const [formData, setFormData] = useState<Metadata>(account.metadata as Metadata);
  console.log('og data', account.metadata)
  useEffect(() => {
    console.log('changed', formData)
  },[formData])

  const orderedKeys: (keyof Metadata)[] = [
    'member_cost',
    'non_member_cost',
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
          <div key={key} className="flex flex-col gap-1">
            <Label htmlFor={key}>{labelText}</Label>
            <textarea
              defaultValue={value as string}
              name={key}
              placeholder={labelText}
              className="textarea-class"
              onChange={(e) => handleChange(e)}
            />
          </div>
        );
      } else if (key === 'opt_in') {
        // Use select for opt_in with options true/false
        return (
          <div key={key} className="flex flex-col gap-1">
            <Label htmlFor={key}>{labelText} Required?</Label>
            <select
              name={key}
              defaultValue={value.required ? 'true' : 'false'}
              onChange={(e) =>
                handleSelectChange(key as keyof Metadata, e.target.value)
              }
            >
              <option value="true">True</option>
              <option value="false">False</option>
            </select>
          </div>
        );
    } else if (key === 'member_cost' || key === 'non_member_cost') {
        return (
          <div key={key} className="flex flex-col gap-1">
            <Label htmlFor={key}>{labelText}</Label>
            <Input
              type="number"
              defaultValue={value as number}
              step="0.01"
              min="0"
              name={key}
              placeholder={labelText}
              onChange={(e) => handleNumberChange(e)}
            />
          </div>
        );
      } else if (typeof value === 'string') {
        return (
          <div key={key} className="flex flex-col gap-1">
            <Label htmlFor={key}>{labelText}</Label>
            <Input
              defaultValue={value}
              name={key}
              placeholder={labelText}
              onChange={(e) => handleChange(e)}
            />
          </div>
        );
      } else if (Array.isArray(value)) {
        return (
          <div key={key} className="flex flex-col gap-1">
            <Label>{labelText}</Label>
            {value.map((item, index) => (
              <div key={`${key}-${index}`} className="flex gap-1">
                <Input
                  defaultValue={item}
                  name={`${key}-${index}`}
                  onChange={(e) =>
                    handleArrayChange(
                      key as keyof Metadata,
                      e.target.value,
                      index
                    )
                  }
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem(key as keyof Metadata, index)}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem(key as keyof Metadata)}
            >
              Add {labelText}
            </button>
          </div>
        );
      }

      return null;
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Ensure the input is valid number or empty string
    const numberValue = value === '' ? '' : parseFloat(value);
    if (!isNaN(numberValue) || value === '') {
      setFormData((prevData) => ({
        ...prevData,
        [name]: numberValue,
      }));
    }
  };


  const handleSelectChange = (key: keyof Metadata, value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [key]: {
        required: value === 'true',
      },
    }));
  };

  const removeArrayItem = (key: keyof Metadata, index: number) => {
    setFormData((prevData) => ({
      ...prevData,
      [key]: (prevData[key] as string[]).filter((_, i) => i !== index),
    }));
  };

  const addArrayItem = (key: keyof Metadata) => {
    setFormData((prevData) => ({
      ...prevData,
      [key]: [...(prevData[key] as string[]), ''], // Add an empty string initially
    }));
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

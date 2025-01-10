'use client';

import { createClient } from '@/lib/supabase/client';
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
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Button } from '../ui/button';
import { Upload, Loader2, X, AlertCircle, InfoIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { v4 as uuidv4 } from 'uuid';
import { Metadata, Cost } from '@/../types/data-table';
import handleEdgeFunctionError from '@/lib/supabase/handle-edge-error';

// interface Metadata {
//   opt_in: {
//     required: boolean;
//   };
//   member_cost: number;
//   non_member_cost: number;
//   minimum_cost: number;
//   firing_types: string[];
//   terms_and_conditions: string;
// }

interface FormProps {
  metadata: Metadata;
}

interface UploadResponse {
  id: string;
  fullPath: string;
  path: string;
}

export default function KilnRequestForm({ metadata }: FormProps) {
  const supabase = createClient();
  const { accountSlug } = useParams();
  const searchParams = useSearchParams();
  const [accountId, setAccountId] = useState<string | null>(null);

  useEffect(() => {
    const id = searchParams.get('accountId');
    if (id) {
      setAccountId(id);
    }
  }, [searchParams]);

  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [optIn, setOptIn] = useState<boolean>(false);
  const [length, setLength] = useState<number | ''>(0);
  const [width, setWidth] = useState<number | ''>(0);
  const [height, setHeight] = useState<number | ''>(0);
  const [roundedLength, setRoundedLength] = useState<number | ''>(0);
  const [roundedWidth, setRoundedWidth] = useState<number | ''>(0);
  const [roundedHeight, setRoundedHeight] = useState<number | ''>(0);
  const [quantity, setQuantity] = useState<number>(1);
  // const [nonMember, setNonMember] = useState<boolean>(false);
  const [firingTypes, setFiringTypes] = useState<string[]>(metadata.firing_types);
  const [selectedFiringType, setSelectedFiringType] = useState<string>(
    metadata.firing_types[0]
  );
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [cost, setCost] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploaded, setUploaded] = useState<string>('');
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const [costs, setCosts] = useState<Cost[]>(metadata.costs);
  const [selectedCost, setSelectedCost] = useState<Cost | undefined>(undefined);
  const [unitCost, setUnitCost] = useState<number>(metadata.costs[0].base_cost);
  const [baseCost, setBaseCost] = useState<number>(0);
  const minCost = Number(metadata.minimum_cost);

  // useEffect(() => {
  //   console.log('here', selectedCost)
  // }, [selectedCost])

  const handleCostChange = (selectedOption: string) => {
    let option = costs.find((cost) => cost.cost_name === selectedOption);
    setSelectedCost(option);
    setUnitCost(option?.base_cost || 0);
  };

  useEffect(() => {
    if (roundedLength && roundedWidth && roundedHeight) {
      // const unitCost = selectedCost ? selectedCost.base_cost : 0;
      // setUnitCost(unitCost);

      const baseCost = roundedLength * roundedWidth * roundedHeight * unitCost;
      setBaseCost(parseFloat(baseCost.toFixed(2)));

      let calcCost;
      if (baseCost < minCost && selectedCost?.enforce_minimum) {
        calcCost = parseFloat((minCost * quantity).toFixed(2));
      } else {
        calcCost = parseFloat((baseCost * quantity).toFixed(2));
      }
      setCost(calcCost);
    }
  }, [
    roundedLength,
    roundedWidth,
    roundedHeight,
    quantity,
    // nonMember,
    selectedCost,
    metadata,
  ]);

  const handleOptInChecked = (checked: boolean) => {
    setOptIn(checked);
  };

  // const handleNonMemberChecked = (checked: boolean) => {
  //   setNonMember(checked);
  // };

  const handleUpload = async (file: File, inputRef: HTMLInputElement) => {
    if (!file) return;

    setUploading(true);
    setError('');
    const fileName = `${accountId}_${firstName}_${lastName}-${uuidv4()}-${
      file.name
    }`; // Create a unique filename
    const { data, error } = (await supabase.storage
      .from('photos') // replace 'photos' with your bucket name
      .upload(fileName, file)) as { data: UploadResponse | null; error: Error };

    if (error) {
      setError(error.message);
      console.error('Error uploading PHOTO file:', error.message);
    } else {
      if (data && data.fullPath) {
        setPhotoUrl(process.env.NEXT_PUBLIC_PUBLIC_S3_URL! + data.fullPath);
        setUploaded(data.path);
        inputRef.value = '';
      }
      console.log('PHOTO file uploaded successfully:', data);
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
      console.error('Error deleting PHOTO file:', error.message);
    } else {
      if (data && data[0]['name'] == uploaded) {
        setUploaded('');
        setIsImageLoaded(false);
        setPhotoUrl('');
        setError('');
      }
      console.log('PHOTO file deleted successfully:', data);
    }
  };

  return (
    <Card className='self-center lg:max-w-[80%] xl:max-w-[50%] xxl:max-w-[40%]'>
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
            <Alert>
              <InfoIcon className='h-4 w-4' />
              <AlertTitle>Terms & Conditions</AlertTitle>
              <AlertDescription>
                <span>{metadata.terms_and_conditions}</span>
              </AlertDescription>
            </Alert>

            {metadata.opt_in.required && (
              <div className='self-end flex items-center space-x-2'>
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
                  required={metadata.opt_in.required}
                />
              </div>
            )}

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

            <Label htmlFor='email'>Email</Label>
            <Input
              type='email'
              id='email'
              name='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className='w-full flex justify-between'>
              <div className='flex flex-col gap-y-2'>
                <Label htmlFor='length'>Length</Label>
                <Input
                  type='number'
                  id='length'
                  name='length'
                  value={length}
                  onChange={(e) => {
                    setLength(Number(e.target.value));
                    setRoundedLength(
                      Number(e.target.value) < 2
                        ? 2
                        : Math.ceil(Number(e.target.value) * 2) / 2
                    );
                  }}
                  onFocus={(e) => {
                    if (height === 0) {
                      setLength('');
                    }
                  }}
                  onBlur={(e) => {
                    if (e.target.value === '') {
                      setLength(0); // Reset to 0 if the user leaves the field empty
                    }
                  }}
                  required
                />
              </div>
              <div className='flex flex-col gap-y-2'>
                <Label htmlFor='width'>Width</Label>
                <Input
                  type='number'
                  id='width'
                  name='width'
                  value={width}
                  onChange={(e) => {
                    setWidth(Number(e.target.value));
                    setRoundedWidth(
                      Number(e.target.value) < 2
                        ? 2
                        : Math.ceil(Number(e.target.value) * 2) / 2
                    );
                  }}
                  onFocus={(e) => {
                    if (height === 0) {
                      setWidth('');
                    }
                  }}
                  onBlur={(e) => {
                    if (e.target.value === '') {
                      setWidth(0); // Reset to 0 if the user leaves the field empty
                    }
                  }}
                  required
                />
              </div>
              <div className='flex flex-col gap-y-2'>
                <Label htmlFor='height'>Height</Label>
                <Input
                  type='number'
                  id='height'
                  name='height'
                  value={height}
                  onChange={(e) => {
                    setHeight(Number(e.target.value));
                    setRoundedHeight(
                      Number(e.target.value) < 2
                        ? 2
                        : Math.ceil(Number(e.target.value) * 2) / 2
                    );
                  }}
                  onFocus={(e) => {
                    if (height === 0) {
                      setHeight('');
                    }
                  }}
                  onBlur={(e) => {
                    if (e.target.value === '') {
                      setHeight(0); // Reset to 0 if the user leaves the field empty
                    }
                  }}
                  required
                />
              </div>
              <div className='flex flex-col gap-y-2'>
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
              </div>
            </div>
            {/* <div className='flex flex-col gap-y-2'>
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
            </div> */}

            <div className='flex flex-col gap-y-2'>
              <Label htmlFor='firing_type'>Firing Type</Label>
              <RadioGroup
                name='firing_type'
                defaultValue={firingTypes[0]}
                onValueChange={setSelectedFiringType}
              >
                {firingTypes.map((type) => (
                  <div
                    key={type}
                    className='flex items-center space-x-2'
                  >
                    <RadioGroupItem
                      value={type}
                      id={type}
                    />
                    <Label htmlFor={type}>{type}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className='flex flex-col gap-y-2'>
              <Label htmlFor='selected_cost'>Rate Type</Label>
              <RadioGroup
                name='selected_cost'
                defaultValue={costs[0].cost_name}
                onValueChange={handleCostChange}
              >
                {costs.map((cost) => (
                  <div
                    key={cost.cost_name}
                    className='flex items-center space-x-2'
                  >
                    <RadioGroupItem
                      value={cost.cost_name}
                      id={cost.cost_name}
                    />
                    <Label htmlFor={cost.cost_name}>{cost.cost_name}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div>
              <Input
                type='hidden'
                id='photo_url'
                name='photo_url'
                value={photoUrl}
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
                      const fileInput = e.target as HTMLInputElement;
                      if (fileInput.files?.[0]) {
                        handleUpload(fileInput.files[0], fileInput);
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
              {uploading ? (
                // 2. Still uploading to server? Show loader/spinner
                <div className='flex items-center gap-2'>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  <p>Uploading your image...</p>
                </div>
              ) : uploaded && photoUrl ? (
                // 3. Upload to server is done; now wait for the actual image to load in the browser
                <div className='w-full h-auto relative'>
                  {/* Optionally show a loading message/spinner until the actual image data is loaded */}
                  {!isImageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      <p>Loading image...</p>
                    </div>
                  )}

                  {/* Hide the "X" until the image is loaded */}
                  {isImageLoaded && (
                    <X
                      className='absolute top-0 right-0 cursor-pointer'
                      onClick={handleDelete}
                    />
                  )}

                  <img
                    src={photoUrl}
                    alt={uploaded}
                    className={`w-auto h-auto transition-opacity ${
                      isImageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    onLoad={() => setIsImageLoaded(true)}
                  />
                </div>
              ) : null}
            </div>

            <input type='hidden' name='rounded_length' value={roundedLength} />
            <input type='hidden' name='rounded_width' value={roundedWidth} />
            <input type='hidden' name='rounded_height' value={roundedHeight} />

            {cost != 0 && (
              <div className='w-full text-xs text-right'>
                <span className=''>
                  Rounded Length: <strong>{roundedLength}</strong> x Rounded
                  Width: <strong>{roundedWidth}</strong> x Rounded Height:{' '}
                  <strong>{roundedHeight}</strong> x{' '}
                  {`${selectedCost?.cost_name} Cost: `}
                  <strong>${selectedCost?.base_cost}</strong> ={' '}
                  <strong>${baseCost}</strong>
                  <br />
                  {baseCost < minCost &&
                    selectedCost?.enforce_minimum &&
                    'Base cost is less than minimum cost, so minimum cost will be applied.'}
                  {baseCost < minCost && selectedCost?.enforce_minimum ? (
                    <>
                      <br />
                      <span>
                        Minimum cost: <strong>${minCost}</strong> x Quantity:{' '}
                        <strong>{quantity}</strong> = <strong>${cost}</strong>
                      </span>
                    </>
                  ) : (
                    <span>
                      x Quantity: <strong>{quantity}</strong> ={' '}
                      <strong>${cost}</strong>
                    </span>
                  )}
                </span>
              </div>
            )}
            <Label htmlFor='cost'>Cost</Label>
            <Input
              type='number'
              id='cost'
              name='cost'
              value={cost}
              readOnly
            />
          </div>
        </CardContent>
        <CardFooter className='text-right'>
          <SubmitButton formAction={addKilnRequest} pendingText='Submitting...'>
            Submit
          </SubmitButton>
        </CardFooter>
      </form>
    </Card>
  );
}

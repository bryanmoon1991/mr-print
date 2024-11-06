'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { useState, useEffect } from 'react';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { checkForDuplicate, reprint } from '@/lib/actions/print-requests';

export type KilnRequest = {
  id: string;
  account_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
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
  updated_at: string;
  created_at: string;
  updated_by: string | null;
  created_by: string | null;
};

export const columns: ColumnDef<KilnRequest>[] = [
  {
    accessorKey: 'created_at',
    header: 'Created At',
    cell: ({ row }) => {
      const date = row.getValue('created_at');
      return new Date(date).toLocaleDateString('en-US');
    },
  },
  {
    accessorKey: 'first_name',
    header: 'First Name',
  },
  {
    accessorKey: 'last_name',
    header: 'Last Name',
  },
  // {
  //   accessorKey: 'email',
  //   header: 'Email',
  // },
  {
    accessorKey: 'non_member',
    header: 'Non Member',
  },
  {
    accessorKey: 'length',
    header: 'Length',
  },
  {
    accessorKey: 'width',
    header: 'Width',
  },
  {
    accessorKey: 'height',
    header: 'Height',
  },
  {
    accessorKey: 'quantity',
    header: 'Quantity',
  },
  {
    accessorKey: 'cost',
    header: 'Cost',
  },
  {
    accessorKey: 'firing_type',
    header: 'Firing Type',
  },
  {
    accessorKey: 'printed',
    header: 'Printed?',
  },
  {
    accessorKey: 'exported',
    header: 'Exported?',
  },
  {
    header: 'Actions',
    id: 'actions',
    cell: ({ row, table }) => {
      const record = row.original;
      const metadata = table?.options?.meta?.metadata;

      const [isOpen, setIsOpen] = useState(false);
      const [updateIsOpen, setUpdateIsOpen] = useState(false);
      const [firstName, setFirstName] = useState(record.first_name);
      const [lastName, setLastName] = useState(record.last_name);
      const [length, setLength] = useState(record.length);
      const [width, setWidth] = useState(record.width);
      const [height, setHeight] = useState(record.height);
      const [quantity, setQuantity] = useState(record.quantity);
      const [nonMember, setNonMember] = useState(record.non_member);
      const [firingType, setFiringType] = useState(record.firing_type);
      const [cost, setCost] = useState(parseFloat(Number.parseFloat(record.cost).toFixed(2)));
      const [error, setError] = useState('');

      useEffect(() => {
        const baseCost = length * width * height;
        const unitCost = nonMember
          ? metadata.non_member_cost
          : metadata.member_cost;
        setCost(Number.parseFloat(baseCost * unitCost * quantity).toFixed(2));
      }, [length, width, height, quantity, nonMember, metadata]);

      const handleNonMemberChecked = (checked: boolean) => {
        setNonMember(checked);
      };
      const handleOpenUpdateModal = () => {
        setUpdateIsOpen(true);
      };
      const handleReprint = async () => {
        if (!record) return;
        const check = await checkForDuplicate(record.account_id, record);
        if (check) {
          setIsOpen(true);
        } else {
          const reprintResult = await reprint(record.account_id, record);
          if (reprintResult > 0) {
            toast.success('Reprint Request Sent!');
            // console.log('reprint', reprintResult)
          }
        }
      };

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='h-8 w-8 p-0'>
                <span className='sr-only'>Open menu</span>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              {/* <DropdownMenuLabel>Actions</DropdownMenuLabel> */}
              <DropdownMenuItem onClick={handleReprint}>
                Reprint Request
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleOpenUpdateModal}>
                Update Record
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Hold up!</DialogTitle>
                <DialogDescription>
                  We noticed a duplicate request waiting to be printed. If you
                  havent received your receipt, please check the printer for:
                  <br />
                  <br />
                  <li>power</li>
                  <li>wifi</li>
                  <li>paper</li>
                  <br />
                  If the printer seems to be in working order and requests are
                  still not going through, please notify the manager onsite and
                  we'll work to get this issue resolved asap!
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
          <Dialog open={updateIsOpen} onOpenChange={setUpdateIsOpen}>
            <DialogContent className=''>
              <DialogHeader>
                <DialogTitle>Edit Record</DialogTitle>
                <DialogDescription>
                  Make changes to the kiln request here. Click save when you're
                  done.
                </DialogDescription>
              </DialogHeader>
              <div className='grid gap-4 py-4'>
                <div className='grid grid-cols-4 items-center gap-4'>
                  <Label htmlFor='first_name' className='text-right'>
                    First Name
                  </Label>
                  <Input
                    type='text'
                    id='first_name'
                    name='first_name'
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className='col-span-3'
                  />
                </div>
                <div className='grid grid-cols-4 items-center gap-4'>
                  <Label htmlFor='last_name' className='text-right'>
                    Last Name
                  </Label>
                  <Input
                    type='text'
                    id='last_name'
                    name='last_name'
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className='col-span-3'
                  />
                </div>
                <div className='grid grid-cols-4 items-center gap-4'>
                  <Label htmlFor='length' className='text-right'>
                    Length
                  </Label>
                  <Input
                    type='number'
                    id='length'
                    name='length'
                    value={length}
                    onChange={(e) => setLength(Number(e.target.value))}
                    className='col-span-3'
                  />
                </div>
                <div className='grid grid-cols-4 items-center gap-4'>
                  <Label htmlFor='width' className='text-right'>
                    Width
                  </Label>
                  <Input
                    type='number'
                    id='width'
                    name='width'
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                    className='col-span-3'
                  />
                </div>
                <div className='grid grid-cols-4 items-center gap-4'>
                  <Label htmlFor='height' className='text-right'>
                    Height
                  </Label>
                  <Input
                    type='number'
                    id='height'
                    name='height'
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className='col-span-3'
                  />
                </div>
                <div className='grid grid-cols-4 items-center gap-4'>
                  <Label htmlFor='quantity' className='text-right'>
                    Quantity
                  </Label>
                  <Input
                    type='number'
                    id='quantity'
                    name='quantity'
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    min={1}
                    className='col-span-3'
                  />
                </div>
                <div className='grid grid-cols-4 items-center gap-4'>
                  <Label htmlFor='cost' className='text-right'>Cost</Label>
                  <Input
                    type='number'
                    id='cost'
                    name='cost'
                    value={cost}
                    className='col-span-3'
                    readOnly
                    disabled
                  />
                </div>
                <div className='grid grid-cols-4 items-center gap-4'>
                  <Label htmlFor='firing_type' className='text-right'>
                    Firing Type
                  </Label>
                  <Select
                    value={firingType}
                    onValueChange={setFiringType}
                    name='firing_type'
                  >
                    <SelectTrigger className='col-span-3'>
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
                <div className='grid grid-cols-4 items-center gap-4'>
                  <Label htmlFor='non_member' className='text-right'>
                    Non Member?
                  </Label>
                  <Checkbox
                    id='non_member'
                    name='non_member'
                    checked={nonMember}
                    onCheckedChange={handleNonMemberChecked}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type='submit'>Save changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      );
    },
  },
];

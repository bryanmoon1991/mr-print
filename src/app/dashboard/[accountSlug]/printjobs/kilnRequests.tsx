'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
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
} from '@/components/ui/dialog';
import { toast } from "sonner"
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
      const date = row.getValue("created_at")
      return new Date(date).toLocaleDateString('en-US')
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
    cell: ({ row }) => {
      const record = row.original;
      const [isOpen, setIsOpen] = useState(false);
      // console.log('row orig', record);
      const handleReprint = async () => {
        if (!record) return;
        const check = await checkForDuplicate(record.account_id, record);
        if (check) {
          setIsOpen(true);
        } else {
          const reprintResult = await reprint(record.account_id, record);
          if (reprintResult > 0) {
            toast.success("Reprint Request Sent!")
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
              <DropdownMenuItem
                onClick={handleReprint}
              >
                Reprint Request
              </DropdownMenuItem>
              <DropdownMenuItem>Update Record</DropdownMenuItem>
              {/* <DropdownMenuSeparator />
            <DropdownMenuItem>View payment details</DropdownMenuItem> */}
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
        </>
      );
    },
  },
];

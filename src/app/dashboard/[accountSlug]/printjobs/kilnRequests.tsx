'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { KilnRequest } from './types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';


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
      const handleReprint = table?.options?.meta?.handleReprint
      const openDialogWithRowData = table?.options?.meta?.openDialogWithRowData

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
              <DropdownMenuItem onClick={() => handleReprint(record)}>
                Reprint Request
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openDialogWithRowData(record)}>
                Update Record
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      );
    },
  },
];

'use client';

import { ColumnDef, TableMeta } from '@tanstack/react-table';
import { MoreHorizontal, RollerCoaster } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { KilnRequest } from './types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';


interface CustomTableMeta extends TableMeta<KilnRequest> {
  handleReprint: (record: KilnRequest) => void;
  handleImageOpen: (url: string) => void;
  openDialogWithRowData: (record: KilnRequest) => void;
}

export const columns: ColumnDef<KilnRequest, CustomTableMeta>[] = [
  {
    accessorKey: 'created_at',
    header: 'Created At',
    cell: ({ row }) => {
      const date = row.getValue('created_at');
      return new Date(date as string).toLocaleString('en-US');
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
    accessorKey: 'pricing_category',
    header: 'Pricing Category',
  },
  {
    header: 'Dimensions',
    cell: ({ row }) => {
      const record = row.original 
      const length = record.length;
      const width = record.width
      const height = record.height
      return `${length}" x ${width}" x ${height}"`;
    }
  },
  {
    header: 'Rounded Dimensions',
    cell: ({ row }) => {
      const record = row.original
      const length = record.rounded_length
      const width = record.rounded_width
      const height = record.rounded_height
      return `${length}" x ${width}" x ${height}"`;
    }
  },
  // {
  //   accessorKey: 'length',
  //   header: 'Length',
  // },
  // {
  //   accessorKey: 'width',
  //   header: 'Width',
  // },
  // {
  //   accessorKey: 'height',
  //   header: 'Height',
  // },
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
      const meta = table?.options?.meta as CustomTableMeta;
      const handleReprint = meta?.handleReprint;
      const handleImageOpen = meta?.handleImageOpen;
      const openDialogWithRowData = meta?.openDialogWithRowData;

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
              <DropdownMenuItem disabled={!record.photo_url} onClick={() => record.photo_url && handleImageOpen(record.photo_url)}>
                View Image
              </DropdownMenuItem>
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

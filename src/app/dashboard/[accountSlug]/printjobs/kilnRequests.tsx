import { ColumnDef } from '@tanstack/react-table';

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
    accessorKey: 'first_name',
    header: 'First Name',
  },
  {
    accessorKey: 'last_name',
    header: 'Last Name',
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
];

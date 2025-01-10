import { DateRange, SelectRangeEventHandler } from 'react-day-picker';
import { ColumnDef, PaginationState } from '@tanstack/react-table';

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  setData: (data: any) => void;
  pageCount: number;
  pageIndex: number;
  pageSize: number;
  setPageIndex: (index: number) => void;
  setPageSize: (size: number) => void;
  exportedFilter: boolean;
  setExportedFilter: (filter: boolean) => void;
  filter: string;
  setFilter: (filter: string) => void;
  filterColumn: string;
  setFilterColumn: (column: string) => void;
  date: DateRange | undefined;
  setDate: SelectRangeEventHandler;
  filterExported: boolean;
  setFilterExported: (filterExported: boolean) => void;
  exportTotals: boolean;
  setExportTotals: (exportTotals: boolean) => void;
  exportData: () => void;
  account: Account;
  onPaginationChange?: (pagination: PaginationState) => void;
}

export type Cost = {
  cost_name: string;
  base_cost: number;
  enforce_minimum: boolean;
};
export interface Metadata {
  logo: { logo_url: string; filename: string };
  member_cost: number;
  non_member_cost: number;
  minimum_cost: number;
  costs: Cost[];
  firing_types: string[];
  opt_in: {
    required: boolean;
  };
  terms_and_conditions: string;
}

export type Account = {
  account_id: string;
  account_role: string;
  is_primary_owner: boolean;
  name: string;
  slug: string;
  personal_account: boolean;
  billing_enabled: boolean;
  billing_status: string;
  created_at: string; // ISO 8601 format
  updated_at: string; // ISO 8601 format
  metadata: Metadata;
};

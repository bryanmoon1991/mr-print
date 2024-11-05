'use client';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Button } from './button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '../ui/label';
import { Switch } from '@/components/ui/switch';
import { CalendarIcon } from 'lucide-react';
import { addDays, format } from 'date-fns';
import { DateRange, SelectRangeEventHandler } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
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
  exportData: () => void;
  testFunc: () => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageCount,
  pageIndex,
  pageSize,
  setPageIndex,
  setPageSize,
  exportedFilter,
  setExportedFilter,
  filter,
  setFilter,
  filterColumn,
  setFilterColumn,
  date,
  setDate,
  filterExported,
  setFilterExported,
  exportData,
  testFunc
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: { pagination: { pageIndex, pageSize } },
    onPaginationChange: ({ pageIndex, pageSize }) => {
      setPageIndex(pageIndex);
      setPageSize(pageSize);
    },
    manualPagination: true, // Enable manual pagination
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div>
      <div className='flex justify-between mb-2'>
        <div>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setPageIndex(pageIndex - 1)}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setPageIndex(pageIndex + 1)}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
        <div>
          <Label className='self-center'>Page Size:</Label>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setPageSize(10)}
            disabled={pageSize === 10}
          >
            10
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setPageSize(20)}
            disabled={pageSize === 20}
          >
            20
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setPageSize(50)}
            disabled={pageSize === 50}
          >
            50
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setPageSize(100)}
            disabled={pageSize === 100}
          >
            100
          </Button>
        </div>
      </div>
      <div className='flex justify-between mb-2'>
        <div className='flex space-x-2'>
          <Select
            value={filterColumn}
            onValueChange={setFilterColumn}
            name='filterColumn'
          >
            <SelectTrigger>
              <SelectValue placeholder='Filter' />
            </SelectTrigger>
            <SelectContent>
              {columns.map((option) => {
                // console.log('filtercolumn', option);
                if (
                  ['first_name', 'last_name', 'email', 'firing_type'].includes(
                    option.accessorKey
                  )
                )
                  return (
                    <SelectItem
                      key={option.accessorKey}
                      value={option.accessorKey}
                    >
                      {option.header}
                    </SelectItem>
                  );
              })}
            </SelectContent>
          </Select>
          <Input
            type='text'
            value={filter}
            className='w-auto'
            onChange={(e) => setFilter(e.target.value)}
            placeholder='Search'
          />
          <Button
            variant='ghost'
            size='sm'
            onClick={() => {
              setFilter('');
              setFilterColumn('');
            }}
          >
            Clear
          </Button>
        </div>
        <div className='flex space-x-2'>
          <Label className='self-center'>View:</Label>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setExportedFilter(false)}
            disabled={!exportedFilter} // Active when 'exported' is false
          >
            Not Exported
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setExportedFilter(true)}
            disabled={exportedFilter} // Active when 'exported' is true
          >
            Exported
          </Button>
        </div>
      </div>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className='flex justify-end mt-2'>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant='default'>Export To CSV</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="mb-4">Export Data to CSV</DialogTitle>
              <DialogDescription>
                <span className='flex flex-col gap-4'>
                  <span className='flex gap-2'>
                    <Label className='self-center' htmlFor='dateRangePicker'>
                      Date Range:
                    </Label>
                    <span id='dateRangePicker' className='grid gap-2'>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id='date'
                            variant={'outline'}
                            className={cn(
                              'w-[300px] justify-start text-left font-normal',
                              !date && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon />
                            {date?.from ? (
                              date.to ? (
                                <>
                                  {format(date.from, 'LLL dd, y')} -{' '}
                                  {format(date.to, 'LLL dd, y')}
                                </>
                              ) : (
                                format(date.from, 'LLL dd, y')
                              )
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className='w-auto p-0' align='start'>
                          <Calendar
                            initialFocus
                            mode='range'
                            defaultMonth={date?.from}
                            selected={date}
                            onSelect={setDate}
                            numberOfMonths={2}
                          />
                        </PopoverContent>
                      </Popover>
                    </span>
                  </span>
                  <span className='flex gap-2'>
                    <Label
                      className='self-center'
                      htmlFor='includeExportedToggle'
                    >
                      Filter Exported?:
                    </Label>
                    <Switch
                      checked={filterExported}
                      onCheckedChange={setFilterExported}
                    />
                  </span>
                </span>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={exportData} variant='default'>
                Download
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

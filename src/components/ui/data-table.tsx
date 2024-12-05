'use client';

import { useState, useEffect } from 'react';
import {
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
import { Checkbox } from './checkbox';
import { Switch } from '@/components/ui/switch';
import { CalendarIcon, ArrowLeft, ArrowRight, Info } from 'lucide-react';
import { format } from 'date-fns';
import { SubmitButton } from './submit-button';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { checkForDuplicate, reprint } from '@/lib/actions/print-requests';
import { updateKilnRequest } from '@/lib/actions/teams';
import { toast } from 'sonner';
import { KilnRequest } from '@/app/dashboard/[accountSlug]/kilnrequests/types';
import type { DataTableProps } from '../../../types/data-table';
import type { Updater } from '@tanstack/react-table';

export function DataTable<TData, TValue>({
  columns,
  data,
  setData,
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
  exportTotals,
  setExportTotals,
  exportData,
  account,
}: DataTableProps<TData, TValue>) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isReprintOpen, setIsReprintOpen] = useState(false);
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [recordId, setRecordId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [length, setLength] = useState<number | ''>(0);
  const [width, setWidth] = useState<number | ''>(0);
  const [height, setHeight] = useState<number | ''>(0);
  const [roundedLength, setRoundedLength] = useState(0);
  const [roundedWidth, setRoundedWidth] = useState(0);
  const [roundedHeight, setRoundedHeight] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [nonMember, setNonMember] = useState(false);
  const [firingType, setFiringType] = useState('');
  const [cost, setCost] = useState(0);

  const openDialogWithRowData = (rowData: KilnRequest) => {
    setRecordId(rowData.id);
    setFirstName(rowData.first_name);
    setLastName(rowData.last_name);
    setEmail(rowData.email);
    setLength(rowData.length);
    setWidth(rowData.width);
    setHeight(rowData.height);
    setRoundedLength(rowData.rounded_length);
    setRoundedWidth(rowData.rounded_width);
    setRoundedHeight(rowData.rounded_height);
    setQuantity(rowData.quantity);
    setNonMember(rowData.non_member || false);
    setFiringType(rowData.firing_type);
    setCost(Number(rowData.cost));
    setIsDialogOpen(true);
  };

  const handleReprint = async (rowData: KilnRequest) => {
    if (!rowData) return;
    const check = await checkForDuplicate(rowData.account_id, rowData);
    if (check) {
      setIsReprintOpen(true);
    } else {
      const reprintResult = await reprint(rowData.account_id, rowData);
      if (reprintResult > 0) {
        toast.success('Reprint Request Sent!');
      }
    }
  };

  const handleImageOpen = (imageUrl: string) => {
    if (!imageUrl) return;
    setImageUrl(imageUrl);
    setIsImageOpen(true);
  };

  const table = useReactTable({
    data,
    columns,
    pageCount,
    meta: {
      account,
      openDialogWithRowData,
      handleReprint,
      handleImageOpen,
    },
    state: { pagination: { pageIndex, pageSize } },
    onPaginationChange: (
      updaterOrValue: Updater<{ pageIndex: number; pageSize: number }>
    ) => {
      if (typeof updaterOrValue === 'function') {
        const newPagination = updaterOrValue({ pageIndex, pageSize });
        setPageIndex(newPagination.pageIndex);
        setPageSize(newPagination.pageSize);
      } else {
        setPageIndex(updaterOrValue.pageIndex);
        setPageSize(updaterOrValue.pageSize);
      }
    },
    // onPaginationChange: (pagination: { pageIndex: number; pageSize: number }) => {
    //   setPageIndex(pagination.pageIndex);
    //   setPageSize(pagination.pageSize);
    // },
    // onPaginationChange: (updaterOrValue: Updater<PaginationState>) => {
    //   if (typeof updaterOrValue === 'function') {
    //     // setPageIndex((old) => updaterOrValue({ pageIndex: old, pageSize }).pageIndex);
    //     // setPageSize((old) => updaterOrValue({ pageIndex, pageSize: old }).pageSize);
    //   } else {
    //     setPageIndex(updaterOrValue.pageIndex);
    //     setPageSize(updaterOrValue.pageSize);
    //   }
    // },
    manualPagination: true, // Enable manual pagination
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleNonMemberChecked = (checked: boolean) => {
    setNonMember(checked);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleCloseImageDialog = () => {
    setImageUrl('');
    setIsImageOpen(false);
  };

  useEffect(() => {
    if (!account.metadata) return;
    const baseCost = roundedLength * roundedWidth * roundedHeight;
    const unitCost = nonMember
      ? account.metadata.non_member_cost
      : account.metadata.member_cost;
    setCost(Number((baseCost * unitCost * quantity).toFixed(2)));
  }, [
    roundedLength,
    roundedWidth,
    roundedHeight,
    quantity,
    nonMember,
    account,
  ]);

  const onRowUpdate = (rowId: string, newRowData: KilnRequest) => {
    setData((oldData: KilnRequest[]) =>
      oldData.map((row) => (row.id === rowId ? newRowData : row))
    );
  };

  const handleUpdateKilnRequest = async (
    prevState: any,
    formData: FormData
  ) => {
    try {
      const updatedData = await updateKilnRequest(prevState, formData);

      onRowUpdate(recordId, updatedData);
      handleCloseDialog();
      toast.success('Successfully updated record!');
    } catch (error) {
      if (error instanceof Error) {
        toast.error('Error updating record!', {
          description: error.message,
        });
        console.error('Error updating row with ID:', recordId, error);
      }
    }
  };

  return (
    <div>
      <div className='flex justify-between mb-2'>
        <div className='flex gap-2'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setPageIndex(pageIndex - 1)}
            disabled={!table.getCanPreviousPage()}
          >
            <ArrowLeft />
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setPageIndex(pageIndex + 1)}
            disabled={!table.getCanNextPage()}
          >
            <ArrowRight />
          </Button>
          <Label className='self-center'>Page {pageIndex + 1}</Label>
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
                if (
                  'accessorKey' in option &&
                  typeof option.accessorKey === 'string' &&
                  typeof option.header === 'string' &&
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
            variant='outline'
            size='sm'
            onClick={() => setExportedFilter(false)}
            disabled={!exportedFilter}
          >
            Not Exported
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setExportedFilter(true)}
            disabled={exportedFilter}
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
              <DialogTitle className='mb-4'>Export Data to CSV</DialogTitle>
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
                  <span className='flex flex-row items-center gap-2'>
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
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info />
                        </TooltipTrigger>
                        <TooltipContent side='right'>
                          <p className='text-xs'>
                            when toggled on, we will only export records that
                            have not been exported yet
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </span>

                  <span className='flex flex-row items-center gap-2'>
                    <Label className='self-center' htmlFor='exportTotalsToggle'>
                      Export Totals?:
                    </Label>
                    <Switch
                      checked={exportTotals}
                      onCheckedChange={setExportTotals}
                    />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info />
                        </TooltipTrigger>
                        <TooltipContent side='right'>
                          <p className='text-xs'>
                            when toggled on, we will include another csv that
                            shows you totals grouped by name
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
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

        <Dialog open={isReprintOpen} onOpenChange={setIsReprintOpen}>
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

        <Dialog open={isImageOpen} onOpenChange={handleCloseImageDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Photo</DialogTitle>
              <DialogDescription>
                <img
                  src={imageUrl}
                  alt='photo of piece'
                  className='w-auto h-auto'
                />
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>

        <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Record</DialogTitle>
              <DialogDescription>
                Make changes to the kiln request here. Click save when you're
                done.
              </DialogDescription>
            </DialogHeader>
            <form className='grid gap-4 py-4'>
              <input
                type='hidden'
                id='record_id'
                name='record_id'
                value={recordId}
              />
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
                <Label htmlFor='email' className='text-right'>
                  Email
                </Label>
                <Input
                  type='email'
                  id='email'
                  name='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  onChange={(e) => {
                    setLength(Number(e.target.value));
                    setRoundedLength(
                      Number(e.target.value) < 2
                        ? 2
                        : Math.ceil(Number(e.target.value) * 2) / 2
                    );
                  }}
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
              <input type='hidden' name='rounded_length' value={roundedLength} />
              <input type='hidden' name='rounded_width' value={roundedWidth} />
              <input type='hidden' name='rounded_height' value={roundedHeight} />
              {roundedLength &&
                roundedWidth &&
                roundedHeight &&
                quantity &&
                cost && (
                  <div className='w-full text-xs text-right'>
                    <span className=''>
                      Rounded Length:<strong>{roundedLength}</strong> x Rounded
                      Width:
                      <strong>{roundedWidth}</strong> x Rounded Height:
                      <strong>{roundedHeight}</strong> <br />x{' '}
                      {nonMember ? 'Non-Member Cost:' : 'Member Cost:'}
                      <strong>
                        {nonMember
                          ? account.metadata.non_member_cost
                          : account.metadata.member_cost}
                      </strong>{' '}
                      x Quantity:<strong>{quantity}</strong> ={' '}
                      <strong>${cost}</strong>
                    </span>
                  </div>
                )}
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='cost' className='text-right'>
                  Cost
                </Label>
                <Input
                  type='number'
                  id='cost'
                  name='cost'
                  value={
                    cost < account.metadata.minimum_cost
                      ? account.metadata.minimum_cost
                      : cost
                  }
                  className='col-span-3'
                  readOnly
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
                    {account.metadata.firing_types.map((option) => (
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
              <DialogFooter>
                <SubmitButton
                  modalSubmit={true}
                  formAction={handleUpdateKilnRequest}
                  pendingText='Updating...'
                >
                  Save changes
                </SubmitButton>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './kilnRequests';
import { toast } from 'sonner';
import { addDays } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { useTeamAccount } from '../teamAccountProvider';
import { parse, unparse } from 'papaparse';
import type { KilnRequest, GroupedData } from './types';

export default function PrintJobsPage() {
  const supabaseClient = createClient();
  const teamAccount = useTeamAccount();

  const [screenWidth, setScreenWidth] = useState<number>(
     window?.innerWidth || 0
  );
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(20);
  const [data, setData] = useState<KilnRequest[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [exportedFilter, setExportedFilter] = useState<boolean>(false); // Default to 'exported' being false
  const [filter, setFilter] = useState<string>('');
  const [filterColumn, setFilterColumn] = useState<string>('');
  const [filterExported, setFilterExported] = useState<boolean>(true);
  const [exportTotals, setExportTotals] = useState<boolean>(true);
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30), // One month ago from today
    to: new Date(), // Today's date
  });

  useEffect(() => {
    if (typeof window != 'undefined') {
      const handleResize = () => {
        setScreenWidth(window.innerWidth);
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  // Fetch data with pagination and filtering
  const fetchData = async () => {
    const from = pageIndex * pageSize;
    const to = from + pageSize - 1;

    let query = supabaseClient
      .from('kiln_requests')
      .select('*', { count: 'exact' })
      .range(from, to)
      .order('created_at', { ascending: true })
      .eq('account_id', teamAccount.account_id)
      .eq('exported', exportedFilter); // Apply the filter based on exported state

    if (filter && filterColumn) {
      query = query.ilike(filterColumn, `%${filter}%`);
    }

    const { data: kiln_requests, error, count } = await query;

    if (error) {
      console.error('Error fetching kiln requests:', error);
      return;
    }

    setData(kiln_requests || []);
    setTotalCount(count || 0);
  };

  // Trigger data fetch on page load, page/index change, or filter change
  useEffect(() => {
    fetchData();
  }, [pageIndex, pageSize, exportedFilter, filter, filterColumn]);

  const exportData = async () => {
    if (date && date.from && date.to) {
      let from = new Date(date.from).toISOString();
      const toDate = new Date(date.to); // Parse the input
      // Add 23 hours, 59 minutes, 59 seconds, and 999 milliseconds
      toDate.setTime(
        toDate.getTime() +
          23 * 60 * 60 * 1000 +
          59 * 60 * 1000 +
          59 * 1000 +
          999
      );
      const to = toDate.toISOString();
      // date values are converted back to UTC and always have a time of 00:00:00
      // this means that a selected date is always right at the start of the date
      // if a user wishes to grab data up to a specific date, they need to add a day to the selected date
      let query = supabaseClient
        .from('kiln_requests')
        .select(
          'created_at, first_name, last_name, email, length, width, height, rounded_length, rounded_width, rounded_height, quantity, cost, firing_type, photo_url, pricing_category, rate_amount, printed, exported'
        )
        .gte('created_at', from)
        .lte('created_at', to)
        .eq('account_id', teamAccount.account_id);

      if (filterExported) {
        query = query.eq('exported', !filterExported);
      }

      const csvQuery = query.csv();
      const { data: exportData, error } = await csvQuery;

      if (error) {
        toast.error('Error exporting data:', { description: error.message });
        console.error('Error exporting data:', error);
        return;
      }

      let parsed = parse<KilnRequest>(exportData, { header: true });

      const transformedData = parsed.data.map((row) => ({
        ...row,
        created_at: new Date(row.created_at).toLocaleString('en-US'), // Convert to local time
      }));

      if (exportTotals) {
        generateGroupedCsv(transformedData);
      }

      let unparsed = unparse(transformedData);
      generateFile(unparsed);
      await markAsExported();
      // console.log('Processed export for: ', teamAccount.slug, teamAccount.account_id);
    } else {
      toast.error('Please select a valid range');
    }
  };
  const formatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const generateFile = (csvData: string) => {
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kiln_requests_${formatter.format(
      date?.from
    )}-${formatter.format(date?.to)}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast.success('Export Success!', {
      description: 'Your CSV download will begin shortly',
    });
  };

  const markAsExported = async () => {
    if (date && date.from && date.to) {
      let from = new Date(date.from).toISOString();
      const toDate = new Date(date.to);
      // Add 23 hours, 59 minutes, 59 seconds, and 999 milliseconds
      toDate.setTime(
        toDate.getTime() +
          23 * 60 * 60 * 1000 +
          59 * 60 * 1000 +
          59 * 1000 +
          999
      );
      const to = toDate.toISOString();
      const updateQuery = supabaseClient
        .from('kiln_requests')
        .update({ exported: true })
        .gte('created_at', from)
        .lte('created_at', to);

      const { error: updateError } = await updateQuery;

      if (updateError) {
        toast.error('Error updating exported status:', {
          description: updateError.message,
        });
        console.error('Error updating exported status:', updateError);
        return;
      }

      toast.success('Successfully marked range as exported!:');
    }
  };

  const generateGroupedCsv = (parsedData: KilnRequest[]) => {
    // Group data by first and last name
    const groupedDataMap = parsedData.reduce<GroupedData>((acc, row) => {
      const fullName = `${row.first_name} ${row.last_name}`.trim();
      const eMail = row.email;

      if (!acc[eMail]) {
        acc[eMail] = {
          full_name: fullName,
          email: eMail,
          cost: 0,
          total_quantity: 0,
          date_range: { earliest: null, latest: null },
        };
      }

      // Sum up the costs
      const cost = parseFloat(row.cost.replace('$', '')) || 0;
      acc[eMail].cost += cost;

      // Sum up the quantity
      const quantity = parseInt(row.quantity.toString(), 10) || 0;
      acc[eMail].total_quantity += quantity;

      // Update date range
      const createdAt = new Date(row.created_at);
      if (
        !acc[eMail].date_range.earliest ||
        createdAt < new Date(acc[eMail].date_range.earliest ?? createdAt)
      ) {
        acc[eMail].date_range.earliest = createdAt;
      }
      if (
        !acc[eMail].date_range.latest ||
        createdAt > new Date(acc[eMail].date_range.latest ?? createdAt)
      ) {
        acc[eMail].date_range.latest = createdAt;
      }

      return acc;
    }, {});

    // Convert the grouped data map back to an array
    const groupedData = Object.values(groupedDataMap).map((entry) => ({
      ...entry,
      cost: `$${entry.cost.toFixed(2)}`, // Format the cost as currency
      date_range: `${
        entry.date_range.earliest
          ? entry.date_range.earliest.toLocaleString('en-US')
          : 'N/A'
      } to ${
        entry.date_range.latest
          ? entry.date_range.latest.toLocaleString('en-US')
          : 'N/A'
      }`, // Format date range
    }));

    // Convert grouped data back to CSV
    const groupedCsv = unparse(groupedData);

    const blob = new Blob([groupedCsv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kiln_request_totals-${formatter.format(
      date?.from
    )}-${formatter.format(date?.to)}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast.success('Export Success!', {
      description: 'Your totals CSV download will begin shortly',
    });
  };

  return (
    <>
      {screenWidth > 768 ? (
        <div className='container mx-auto'>
          <DataTable
            columns={columns}
            data={data}
            setData={setData}
            pageCount={Math.ceil(totalCount / pageSize)}
            pageIndex={pageIndex}
            pageSize={pageSize}
            setPageIndex={setPageIndex}
            setPageSize={setPageSize}
            exportedFilter={exportedFilter}
            setExportedFilter={setExportedFilter}
            filter={filter}
            setFilter={setFilter}
            filterColumn={filterColumn}
            setFilterColumn={setFilterColumn}
            date={date}
            setDate={setDate}
            filterExported={filterExported}
            setFilterExported={setFilterExported}
            exportData={exportData}
            setExportTotals={setExportTotals}
            exportTotals={exportTotals}
            account={teamAccount}
          />
        </div>
      ) : (
        <span>sorry, you must view this page on a computer</span>
      )}
    </>
  );
}

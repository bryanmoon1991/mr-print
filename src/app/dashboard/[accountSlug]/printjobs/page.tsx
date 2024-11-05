'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './kilnRequests';
import { toast } from "sonner"
import { addDays, format } from "date-fns"
import { DateRange } from "react-day-picker"

export default function PrintJobsPage({ params: { accountSlug } }) {
  const supabaseClient = createClient();

  // Define pagination and filter state
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [data, setData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [exportedFilter, setExportedFilter] = useState(false); // Default to 'exported' being false
  const [filter, setFilter] = useState('');
  const [filterColumn, setFilterColumn] = useState('');
  // const [startDate, setStartDate] = useState('');
  // const [endDate, setEndDate] = useState('');
  const [filterExported, setFilterExported] = useState(true);
  // const [date, setDate] = useState<DateRange | undefined>({
  //   from: new Date(2022, 0, 20),
  //   to: addDays(new Date(2022, 0, 20), 20),
  // })
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30), // One month ago from today
    to: new Date(), // Today's date
  });

  // Fetch data with pagination and filtering
  const fetchData = async () => {
    const from = pageIndex * pageSize;
    const to = from + pageSize - 1;

    let query = supabaseClient
      .from('kiln_requests')
      .select('*', { count: 'exact' })
      .range(from, to)
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

  const testFunc = async () => {
    console.log('hit')
  }
  const exportData = async () => {
    // Step 1: Fetch the data to be exported
    console.log('hit', date)
    if (date && date.from && date.to) {
      let query = supabaseClient
        .from('kiln_requests')
        .select('*')
        .gte('created_at', date.from)
        .lte('created_at', date.to);

      if (filterExported) {
        query = query.eq('exported', !filterExported);
      }
      const { data: exportData, error } = await query;

      if (error) {
        toast.error('Error exporting data:', {description: error.message});
        console.error('Error exporting data:', error);
        return;
      }

      const csvData = exportData
        .map((row) => Object.values(row).join(','))
        .join('\n');

      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `export_${date.from}_${date.to}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);

      // Step 3: Mark the exported rows as `exported: true`
      const updateQuery = supabaseClient
        .from('kiln_requests')
        .update({ exported: true })
        .eq('exported', false)
        .gte('created_at', date.from)
        .lte('created_at', date.to);

      const { error: updateError } = await updateQuery;

      if (updateError) {
        toast.error('Error updating exported status:', {description: updateError.message});
        console.error('Error updating exported status:', updateError);
        return;
      }

      toast.success('Export Success!', {description: 'Your CSV download will begin shortly'});
      console.log('Rows successfully marked as exported.');
    } else {
      toast.error('Please select a range');
    }
  };

  return (
    <div className='container mx-auto'>
      <DataTable
        columns={columns}
        data={data}
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
        exportDate={exportData}
        testFunc={testFunc}
      />
    </div>
  );
}

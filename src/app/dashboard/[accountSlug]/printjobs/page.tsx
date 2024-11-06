'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './kilnRequests';
import { toast } from 'sonner';
import { addDays, format } from 'date-fns';
import { DateRange } from 'react-day-picker';

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
  const [filterExported, setFilterExported] = useState(true);
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
      .order('created_at', { ascending: true })
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
    console.log('hit');
  };

  const exportData = async () => {
    console.log('here');
    console.log('hit', date);
    if (date && date.from && date.to) {
      let query = supabaseClient
        .from('kiln_requests')
        .select(
          'first_name, last_name, email, length, width, height, quantity, cost, firing_type, photo_url, non_member, printed, exported'
        )
        .gte(
          'created_at',
          format(new Date(date.from), "yyyy-MM-dd'T'HH:mm:ss'Z'")
        )
        .lte(
          'created_at',
          format(new Date(date.to), "yyyy-MM-dd'T'HH:mm:ss'Z'")
        );

      if (filterExported) {
        query = query.eq('exported', !filterExported);
      }

      query = query.csv();
      const { data: exportData, error } = await query;

      if (error) {
        toast.error('Error exporting data:', { description: error.message });
        console.error('Error exporting data:', error);
        return;
      }

      generateFile(exportData);
      await markAsExported();
    } else {
      toast.error('Please select a valid range');
    }
  };
  const formatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const generateFile = (csvData) => {
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kiln_requests_${formatter.format(
      date?.from
    )}_${formatter.format(date?.to)}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast.success('Export Success!', {
      description: 'Your CSV download will begin shortly',
    });
  };

  const markAsExported = async () => {
    if (date && date.from && date.to) {
      const updateQuery = supabaseClient
        .from('kiln_requests')
        .update({ exported: true })
        .gte(
          'created_at',
          format(new Date(date.from), "yyyy-MM-dd'T'HH:mm:ss'Z'")
        )
        .lte(
          'created_at',
          format(new Date(date.to), "yyyy-MM-dd'T'HH:mm:ss'Z'")
        );

      const { error: updateError } = await updateQuery;

      if (updateError) {
        toast.error('Error updating exported status:', {
          description: updateError.message,
        });
        console.error('Error updating exported status:', updateError);
        return;
      }

      toast.success('Successfully marked range as exported!:');
      // console.log('Rows successfully marked as exported.');
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
        exportData={exportData}
        testFunc={testFunc}
      />
    </div>
  );
}

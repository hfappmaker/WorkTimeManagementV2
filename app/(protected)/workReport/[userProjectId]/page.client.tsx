'use client';

import { useState, useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { createWorkReportAction, getUserProjectWorkReportsAction } from '@/actions/formAction';
import Link from 'next/link';
import ModalDialog from '@/components/ModalDialog';
import { DateInput } from '@/components/ui/date-input';
import { WorkReport } from '@prisma/client';
import LoadingOverlay from '@/components/LoadingOverlay';
import { useIsClient } from '@/hooks/use-is-client';
interface ReportFormValues {
  startDate: string;
  endDate: string;
}

export default function WorkTimeReportClient({ userProjectId }: { userProjectId: string }) {
  const [message, setMessage] = useState('');
  const [workReports, setWorkReports] = useState<WorkReport[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const isClient = useIsClient();
  const [isPending, startTransition] = useTransition();

  const reportForm = useForm<ReportFormValues>({
    defaultValues: {
      startDate: '',
      endDate: '',
    },
  });

  const searchForm = useForm<{ searchQuery: string }>({
    defaultValues: { searchQuery: '' }
  });

  // Fetch work time reports for the project (filtered by memo if provided)
  const fetchReports = async () => {
    try {
      const data = await getUserProjectWorkReportsAction(userProjectId);
      if (data) {
        setWorkReports(data);
      } else {
        setMessage('Failed to fetch reports');
      }
    } catch (error: any) {
      setMessage(error.message || 'Failed to fetch reports');
    }
  };

  // Load the reports on initial render
  useEffect(() => {
    startTransition(async () => {
      await fetchReports();
    });
  }, [userProjectId]);

  // Handle submission of the search form
  const onSearchSubmit = (data: { searchQuery: string }) => {
    startTransition(async () => {
      await fetchReports();
    });
  };

  // Handle creation of a new work time report
  const handleCreateReport = async (data: ReportFormValues) => {
    const { startDate, endDate } = data;
    if (new Date(startDate) > new Date(endDate)) {
      setMessage('Start date cannot be after End date.');
      return;
    }
    try {
      await createWorkReportAction(userProjectId, new Date(startDate), new Date(endDate));
      setMessage('');
      // Refresh report list after creation
      await fetchReports();
      // Close dialog and reset the creation form
      setShowCreateDialog(false);
      reportForm.reset();
    } catch (error: any) {
      setMessage(error.message || 'Failed to create report');
    }
  };

  return (
    <LoadingOverlay isClient={isClient} isPending={isPending}>
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">
          Work Time Reports for Project {userProjectId}
      </h1>
      {message && <p className="mb-4 text-red-500">{message}</p>}

      <div className="flex items-center mb-4">
        <Form {...searchForm}>
          <form
            onSubmit={searchForm.handleSubmit(onSearchSubmit)}
            className="flex-grow flex items-center"
          >
            <FormField
              control={searchForm.control}
              name="searchQuery"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Search work reports"
                      className="mr-2"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit">Search</Button>
          </form>
        </Form>
        <Button onClick={() => setShowCreateDialog(true)} className="ml-4">
          Create Work Time Report
        </Button>
      </div>

      {workReports.length === 0 ? (
        <p>No work reports found.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {workReports.map((workReport) => (
            <li key={workReport.id} className="py-2">
              <Link href={`/workReport/${userProjectId}/${workReport.id}`}>
                <div className="cursor-pointer hover:text-blue-500">
                  WorkReport: {workReport.startDate.toLocaleDateString()} - {workReport.endDate.toLocaleDateString()} {workReport.memo ? `(${workReport.memo})` : ''}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {showCreateDialog && (
        <ModalDialog isOpen={showCreateDialog} title="Create Work Time Report">
          <Form {...reportForm}>
            <form onSubmit={reportForm.handleSubmit(handleCreateReport)} className="space-y-4">
              <FormField
                control={reportForm.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="start-date">Start Date</FormLabel>
                    <FormControl>
                      <DateInput id="start-date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={reportForm.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="end-date">End Date</FormLabel>
                    <FormControl>
                      <DateInput id="end-date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create</Button>
              </div>
            </form>
          </Form>
        </ModalDialog>
      )}
      </div>
    </LoadingOverlay>
  );
}


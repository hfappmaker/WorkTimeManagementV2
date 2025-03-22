'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { createWorkReportAction, getWorkReportsByContractIdAction, getWorkReportsByContractIdAndYearMonthDateRangeAction } from '@/actions/work-report';
import { getContractByIdAction } from '@/actions/contract';
import { Dialog, DialogContent, DialogTitle, DialogOverlay, DialogPortal, DialogHeader } from '@/components/ui/dialog';
import { Contract, WorkReport } from '@prisma/client';
import FormError from "@/components/form-error";
import FormSuccess from "@/components/form-success";
import { useRouter } from 'next/navigation';
import { useTransitionContext } from '@/contexts/TransitionContext';
import { YearMonthPickerField } from '@/components/ui/date-picker';
interface ReportFormValues {
  yearMonth: Date;
}

// 検索フォームの型定義を追加
interface SearchFormValues {
  from: Date;
  to: Date;
}

export default function ContractClientPage({ contractId }: { contractId: string }) {
  const [error, setError] = useState<{ message: string, date: Date }>({ message: "", date: new Date() });
  const [success, setSuccess] = useState<{ message: string, date: Date }>({ message: "", date: new Date() });
  const [workReports, setWorkReports] = useState<WorkReport[]>([]);
  const [contract, setContract] = useState<Contract | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { startTransition } = useTransitionContext();
  const router = useRouter();

  // 現在の年月を取得
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const currentYearMonth = new Date(Date.UTC(currentYear, currentMonth, 1));
  const currentYearMonthMinusOne = new Date(Date.UTC(
    currentMonth === 0 ? currentYear - 1 : currentYear,
    currentMonth === 0 ? 11 : currentMonth - 1,
    1
  ));

  const reportForm = useForm<ReportFormValues>({
    defaultValues: {
      yearMonth: currentYearMonth,
    },
  });

  // 検索フォームの初期値を設定
  const searchForm = useForm<SearchFormValues>({
    defaultValues: {
      from: currentYearMonthMinusOne,
      to: currentYearMonth,
    }
  });

  // コントラクト情報を取得
  useEffect(() => {
    startTransition(async () => {
      try {
        let contractData = await getContractByIdAction(contractId);
        if (contractData) {
          // 念のための保険：クライアント側でも変換処理を行う
          contractData = JSON.parse(JSON.stringify(contractData));
          setContract(contractData);
        }
      } catch (error: any) {
        setError(error.message || '契約情報の取得に失敗しました');
      }
    });
  }, [contractId]);

  // Fetch work time reports for the project
  const fetchReports = async () => {
    try {
      const data = await getWorkReportsByContractIdAction(contractId);
      if (data) {
        setWorkReports(data);
      } else {
        setError({ message: '作業報告書の取得に失敗しました', date: new Date() });
      }
    } catch (error: any) {
      setError({ message: error.message || '作業報告書の取得に失敗しました', date: new Date() });
    }
  };

  // Load the reports on initial render
  useEffect(() => {
    startTransition(async () => {
      await fetchReports();
    });
  }, [contractId]);

  // 検索処理の更新
  const onSearchSubmit = async (data: SearchFormValues) => {
    startTransition(async () => {
      try {
        const fromDate = data.from;
        const toDate = data.to;
        // 検索条件を追加してfetchReportsを呼び出す
        await getWorkReportsByContractIdAndYearMonthDateRangeAction(contractId, fromDate, toDate);
      } catch (error: any) {
        setError({ message: error.message || '検索に失敗しました', date: new Date() });
      }
    });
  };

  // Handle creation of a new work time report
  const handleCreateReport = async (values: ReportFormValues) => {
    try {
      if (!contract) {
        setError({ message: '契約情報がありません', date: new Date() });
        return;
      }

      const targetDate = values.yearMonth;

      startTransition(async () => {
        await createWorkReportAction(contractId, targetDate);
        setSuccess({ message: '作業報告書を作成しました', date: new Date() });
        // Refresh report list after creation
        await fetchReports();
        // Close dialog and reset the creation form
        setShowCreateDialog(false);
        reportForm.reset({
          yearMonth: currentYearMonth,
        });
      });
    } catch (error: any) {
      setError({ message: error.message || '作業報告書の作成に失敗しました', date: new Date() });
    }
  };

  const handleNavigation = (workReportId: string) => {
    startTransition(() => {
      router.push(`/workReport/${workReportId}`);
    });
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">
        作業報告書一覧（{contract?.name}）
      </h1>
      {error && <FormError message={error.message} resetSignal={error.date.getTime()} />}
      {success && <FormSuccess message={success.message} resetSignal={success.date.getTime()} />}
      <div className="flex items-center mb-4">
        <Form {...searchForm}>
          <form
            onSubmit={searchForm.handleSubmit(onSearchSubmit)}
            className="flex-grow flex items-center gap-4"
          >
            <YearMonthPickerField
              control={searchForm.control}
              name="from"
              yearTriggerClassName="w-24"
              monthTriggerClassName="w-20"
            />
            <span>から</span>
            <YearMonthPickerField
              control={searchForm.control}
              name="to"
              yearTriggerClassName="w-24"
              monthTriggerClassName="w-20"
            />
            <Button type="submit">検索</Button>
          </form>
        </Form>
        <Button onClick={() => setShowCreateDialog(true)} className="ml-4">
          作業報告書を作成
        </Button>
      </div>

      {workReports.length === 0 ? (
        <p>作業報告書がありません</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {workReports.map((workReport) => (
            <li key={workReport.id} className="py-2">
              <div
                onClick={() => handleNavigation(workReport.id)}
                className="cursor-pointer hover:text-blue-500"
              >
                {workReport.targetDate.getFullYear()}年{workReport.targetDate.getMonth() + 1}月分
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogPortal>
          <DialogOverlay />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>作業報告書を作成</DialogTitle>
            </DialogHeader>
            <Form {...reportForm}>
              <form onSubmit={reportForm.handleSubmit(handleCreateReport)} className="space-y-4">
                <div className="flex gap-4">
                  <YearMonthPickerField
                    control={reportForm.control}
                    name="yearMonth"
                    yearTriggerClassName="w-24"
                    monthTriggerClassName="w-20"
                    defaultValue={currentYearMonth}
                    showClearButton={false}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" onClick={() => setShowCreateDialog(false)}>
                    キャンセル
                  </Button>
                  <Button type="submit">作成</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </div>
  );
}


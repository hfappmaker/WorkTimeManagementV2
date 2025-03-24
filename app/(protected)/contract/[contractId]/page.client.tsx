'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { createWorkReportAction, getWorkReportsByContractIdAndYearMonthDateRangeAction } from '@/actions/work-report';
import { getContractByIdAction } from '@/actions/contract';
import { Dialog, DialogContent, DialogTitle, DialogOverlay, DialogPortal, DialogHeader } from '@/components/ui/dialog';
import { WorkReport } from "@/types/work-report";
import FormError from "@/components/form-error";
import FormSuccess from "@/components/form-success";
import { useRouter } from 'next/navigation';
import { useTransitionContext } from '@/contexts/TransitionContext';
import { YearMonthPickerField } from '@/components/ui/date-picker';
import { z } from 'zod';
import { Contract } from "@/types/contract";

const createWorkReportFormSchema = z.object({
  yearMonth: z.date(),
});

type CreateWorkReportFormValues = z.infer<typeof createWorkReportFormSchema>;

const searchFormSchema = z.object({
  from: z.date().optional(),
  to: z.date().optional(),
});

type SearchFormValues = z.infer<typeof searchFormSchema>;

type DialogType = "create" | "search" | null;

// 共通のダイアログコンポーネント
const CommonDialog = ({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) => (
  <Dialog open={isOpen} onOpenChange={(open) => {
    if (!open) onClose();
  }}>
    <DialogPortal>
      <DialogOverlay />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </DialogPortal>
  </Dialog>
);

export default function ContractClientPage({ contractId }: { contractId: string }) {
  const [error, setError] = useState<{ message: string, date: Date }>({ message: "", date: new Date() });
  const [success, setSuccess] = useState<{ message: string, date: Date }>({ message: "", date: new Date() });
  const [workReports, setWorkReports] = useState<WorkReport[]>([]);
  const [contract, setContract] = useState<Contract | null>(null);
  const [activeDialog, setActiveDialog] = useState<DialogType>(null);

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

  const [searchFormValues, setSearchFormValues] = useState<SearchFormValues>({
    from: currentYearMonthMinusOne,
    to: currentYearMonth,
  });

  const createWorkReportForm = useForm<CreateWorkReportFormValues>({
    defaultValues: {
      yearMonth: currentYearMonth,
    },
  });

  // 検索フォームの初期値を設定
  const searchForm = useForm<SearchFormValues>({
    defaultValues: searchFormValues
  });

  // コントラクト情報を取得
  useEffect(() => {
    startTransition(async () => {
      try {
        const contractData = await getContractByIdAction(contractId);
        setContract(contractData);
      } catch (error: any) {
        setError(error.message || '契約情報の取得に失敗しました');
      }
    });
  }, [contractId]);

  // Fetch work time reports for the project
  const fetchReports = async (fromDate?: Date, toDate?: Date) => {
    try {
      const data = await getWorkReportsByContractIdAndYearMonthDateRangeAction(contractId, fromDate, toDate);
      if (data) {
        setWorkReports(data);
        setSearchFormValues({
          from: fromDate,
          to: toDate,
        });
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
      await fetchReports(searchFormValues.from, searchFormValues.to);
    });
  }, [contractId]);

  // 検索処理の更新
  const onSearchSubmit = async (data: SearchFormValues) => {
    startTransition(async () => {
      try {
        const fromDate = data.from;
        const toDate = data.to;
        // 検索条件を追加してfetchReportsを呼び出す
        await fetchReports(fromDate, toDate);
      } catch (error: any) {
        setError({ message: error.message || '検索に失敗しました', date: new Date() });
      }
    });
  };

  // Handle creation of a new work time report
  const handleCreateReport = async (values: CreateWorkReportFormValues) => {
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
        await fetchReports(searchFormValues.from, searchFormValues.to);
        // Close dialog and reset the creation form
        setActiveDialog(null);
        createWorkReportForm.reset({
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
        <div className="flex items-center gap-2 mr-4">
          <span className="text-muted-foreground">
            {searchFormValues.from ? searchFormValues.from.getFullYear() + "年" + (searchFormValues.from?.getMonth() + 1) + "月" : ""}
          </span>
          <span className="text-muted-foreground">
            ~
          </span>
          <span className="text-muted-foreground">
            {searchFormValues.to ? searchFormValues.to.getFullYear() + "年" + (searchFormValues.to?.getMonth() + 1) + "月" : ""}
          </span>
        </div>
        <Button onClick={() => setActiveDialog("search")} className="mr-4">
          検索
        </Button>
        <Button onClick={() => setActiveDialog("create")}>
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

      {/* 検索ダイアログ */}
      <CommonDialog
        isOpen={activeDialog === "search"}
        onClose={() => setActiveDialog(null)}
        title="作業報告書を検索"
      >
        <Form {...searchForm}>
          <form
            onSubmit={searchForm.handleSubmit((data) => {
              onSearchSubmit(data);
              setActiveDialog(null);
            })}
            className="space-y-4"
          >
            <div className="flex items-center gap-4">
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
              <span>まで</span>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" onClick={() => {
                setActiveDialog(null);
                searchForm.reset(searchFormValues);
              }}>
                キャンセル
              </Button>
              <Button type="submit">検索</Button>
            </div>
          </form>
        </Form>
      </CommonDialog>

      {/* 作成ダイアログ */}
      <CommonDialog
        isOpen={activeDialog === "create"}
        onClose={() => setActiveDialog(null)}
        title="作業報告書を作成"
      >
        <Form {...createWorkReportForm}>
          <form onSubmit={createWorkReportForm.handleSubmit(handleCreateReport)} className="space-y-4">
            <div className="flex gap-4">
              <YearMonthPickerField
                control={createWorkReportForm.control}
                name="yearMonth"
                yearTriggerClassName="w-24"
                monthTriggerClassName="w-20"
                showClearButton={false}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" onClick={() => {
                setActiveDialog(null);
                createWorkReportForm.reset({
                  yearMonth: currentYearMonth,
                });
              }}>
                キャンセル
              </Button>
              <Button type="submit">作成</Button>
            </div>
          </form>
        </Form>
      </CommonDialog>
    </div>
  );
}


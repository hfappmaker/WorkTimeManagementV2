'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { createWorkReportAction, getWorkReportsByContractIdAction, getContractByIdAction, getWorkReportsByContractIdAndYearAndMonthRangeAction } from '@/actions/formAction';
import { Dialog, DialogContent, DialogTitle, DialogOverlay, DialogPortal, DialogHeader } from '@/components/ui/dialog';
import { Contract, WorkReport } from '@prisma/client';
import { ComboBox } from '@/components/ui/select';
import FormError from "@/components/form-error";
import FormSuccess from "@/components/form-success";
import { useRouter } from 'next/navigation';
import { useTransitionContext } from '@/contexts/TransitionContext';

interface ReportFormValues {
  year: string;
  month: string;
}

// 検索フォームの型定義を追加
interface SearchFormValues {
  fromYear: string;
  fromMonth: string;
  toYear: string;
  toMonth: string;
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
  const currentYear = currentDate.getFullYear().toString();
  const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');

  const reportForm = useForm<ReportFormValues>({
    defaultValues: {
      year: currentYear,
      month: currentMonth,
    },
  });

  // 検索フォームの初期値を設定
  const searchForm = useForm<SearchFormValues>({
    defaultValues: {
      fromYear: currentYear,
      fromMonth: '01',
      toYear: currentYear,
      toMonth: currentMonth,
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
        const fromDate = {
          year: parseInt(data.fromYear),
          month: parseInt(data.fromMonth)
        };
        const toDate = {
          year: parseInt(data.toYear),
          month: parseInt(data.toMonth)
        };
        // 検索条件を追加してfetchReportsを呼び出す
        await getWorkReportsByContractIdAndYearAndMonthRangeAction(contractId, fromDate.year, fromDate.month, toDate.year, toDate.month);
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

      // 年と月が文字列の場合は数値に変換する
      const yearInt = parseInt(values.year);
      const monthInt = parseInt(values.month);

      startTransition(async () => {
        await createWorkReportAction(contractId, yearInt, monthInt);
        setSuccess({ message: '作業報告書を作成しました', date: new Date() });
        // Refresh report list after creation
        await fetchReports();
        // Close dialog and reset the creation form
        setShowCreateDialog(false);
        reportForm.reset({
          year: currentYear,
          month: currentMonth,
        });
      });
    } catch (error: any) {
      setError({ message: error.message || '作業報告書の作成に失敗しました', date: new Date() });
    }
  };

  // 年の選択肢を生成 (2025年から2099年までの範囲)
  const yearOptions = () => {
    return Array.from({ length: 75 }, (_, i) => ({
      value: (2025 + i).toString(),
      label: `${2025 + i}年`
    }));
  };

  // 月の選択肢を生成（ComboBox用にオブジェクト形式で）
  const monthOptions = [
    { value: '01', label: '1月' },
    { value: '02', label: '2月' },
    { value: '03', label: '3月' },
    { value: '04', label: '4月' },
    { value: '05', label: '5月' },
    { value: '06', label: '6月' },
    { value: '07', label: '7月' },
    { value: '08', label: '8月' },
    { value: '09', label: '9月' },
    { value: '10', label: '10月' },
    { value: '11', label: '11月' },
    { value: '12', label: '12月' },
  ];

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
            <div className="flex items-center gap-2">
              <FormField
                control={searchForm.control}
                name="fromYear"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ComboBox
                        {...field}
                        name="fromYear"
                        triggerClassName="w-24"
                        options={yearOptions()}
                        placeholder="年"
                        value={field.value}
                        onValueChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={searchForm.control}
                name="fromMonth"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ComboBox
                        {...field}
                        name="fromMonth"
                        triggerClassName="w-20"
                        options={monthOptions}
                        placeholder="月"
                        value={field.value}
                        onValueChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <span>から</span>
            </div>

            <div className="flex items-center gap-2">
              <FormField
                control={searchForm.control}
                name="toYear"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ComboBox
                        {...field}
                        name="toYear"
                        triggerClassName="w-24"
                        options={yearOptions()}
                        placeholder="年"
                        value={field.value}
                        onValueChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={searchForm.control}
                name="toMonth"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ComboBox
                        {...field}
                        name="toMonth"
                        triggerClassName="w-20"
                        options={monthOptions}
                        placeholder="月"
                        value={field.value}
                        onValueChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <span>まで</span>
            </div>
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
                {workReport.year}年{workReport.month}月分
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
                  <FormField
                    control={reportForm.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>年</FormLabel>
                        <FormControl>
                          <ComboBox
                            {...field}
                            name="year"
                            triggerClassName="w-48"
                            options={yearOptions()}
                            defaultValue={currentYear}
                            placeholder="年を選択"
                            value={field.value}
                            onValueChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={reportForm.control}
                    name="month"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>月</FormLabel>
                        <FormControl>
                          <ComboBox
                            {...field}
                            name="month"
                            triggerClassName="w-48"
                            options={monthOptions}
                            defaultValue={currentMonth}
                            placeholder="月を選択"
                            value={field.value}
                            onValueChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
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


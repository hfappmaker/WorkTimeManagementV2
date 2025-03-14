'use client';

import { useState, useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { createWorkReportAction, getWorkReportsByContractIdAction, getContractByIdAction } from '@/actions/formAction';
import { Dialog, DialogContent, DialogTitle, DialogOverlay, DialogPortal } from '@/components/ui/dialog';
import { Contract, WorkReport } from '@prisma/client';
import LoadingOverlay from '@/components/LoadingOverlay';
import { useIsClient } from '@/hooks/use-is-client';
import { ComboBox } from '@/components/ui/select';
import FormError from "@/components/form-error";
import FormSuccess from "@/components/form-success";
import { useRouter } from 'next/navigation';

interface ReportFormValues {
  year: string;
  month: string;
}

export default function ContractClientPage({ contractId }: { contractId: string }) {
  const [error, setError] = useState<{ message: string, date: Date }>({ message: "", date: new Date() });
  const [success, setSuccess] = useState<{ message: string, date: Date }>({ message: "", date: new Date() });
  const [workReports, setWorkReports] = useState<WorkReport[]>([]);
  const [contract, setContract] = useState<Contract | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const isClient = useIsClient();
  const [isPending, startTransition] = useTransition();
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

  const searchForm = useForm<{ searchQuery: string }>({
    defaultValues: { searchQuery: '' }
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

  // Handle submission of the search form
  const onSearchSubmit = (data: { searchQuery: string }) => {
    startTransition(async () => {
      await fetchReports();
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

  // 年の選択肢を生成 (現在年から前後2年) - ComboBox用のフォーマットに変更
  const yearOptions = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => ({
      value: (currentYear - 2 + i).toString(),
      label: `${currentYear - 2 + i}年`
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

  // Link クリック時の遷移処理
  const handleNavigation = (workReportId: string) => {
    startTransition(() => {
      router.push(`/workReport/${workReportId}`);
    });
  };

  return (
    <LoadingOverlay isClient={isClient} isPending={isPending}>
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
                        placeholder="作業報告書を検索"
                        className="mr-2"
                      />
                    </FormControl>
                  </FormItem>
                )}
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
              <DialogTitle>作業報告書を作成</DialogTitle>
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
    </LoadingOverlay>
  );
}


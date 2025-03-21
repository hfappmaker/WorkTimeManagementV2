"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogOverlay, DialogPortal, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import FormError from "@/components/form-error";
import FormSuccess from "@/components/form-success";
import { Form, FormItem, FormLabel, FormControl, FormMessage, FormField } from "@/components/ui/form";
import { createContractAction, deleteContractAction, updateContractAction, getContractsByClientIdAction } from '@/actions/formAction';
import { ContractSchema } from '@/schemas';
import { useTransitionContext } from "@/contexts/TransitionContext";
import { z } from "zod";
import { ComboBox } from "@/components/ui/select";
import { TimePickerField } from "@/components/ui/time-picker";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Contract {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date | undefined;
  unitPrice: number | undefined;
  settlementMin: number | undefined;
  settlementMax: number | undefined;
  upperRate: number | undefined;
  lowerRate: number | undefined;
  middleRate: number | undefined;
  dailyWorkMinutes: number | undefined;
  monthlyWorkMinutes: number | undefined;
  basicStartTime: string | undefined;
  basicEndTime: string | undefined;
  basicBreakDuration: number | undefined;
  closingDay: number | undefined;
}

interface Client {
  id: string;
  name: string;
  createUserId: string;
}

// 共通のContractFormコンポーネント
type ContractFormProps = {
  form: UseFormReturn<z.infer<typeof ContractSchema>>;
  onSubmit: (data: z.infer<typeof ContractSchema>) => void;
  onCancel: () => void;
  submitButtonText: string;
};

type DialogType = "create" | "edit" | "delete" | "details" | null;

const ContractForm = ({ form, onSubmit, onCancel, submitButtonText }: ContractFormProps) => {
  // Add state for rate type
  const [rateType, setRateType] = useState<"upperLower" | "middle">("upperLower");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Contract Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>契約名</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ""} placeholder="契約名を入力" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Start Date and End Date in the same row */}
        <div className="flex gap-6">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>開始日</FormLabel>
                <FormControl>
                  <DatePicker
                    {...field}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="開始日を選択"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>終了日</FormLabel>
                <FormControl>
                  <DatePicker
                    {...field}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="終了日を選択（任意）"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Unit Price, Settlement Min, Settlement Max in the same row */}
        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="unitPrice"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>単価（円）</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} type="number" placeholder="（例）5000" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="settlementMin"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>精算下限（時間）</FormLabel>
                <FormControl>
                  <Input  {...field} value={field.value ?? ""} type="number" placeholder="（例）140" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="settlementMax"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>精算上限（時間）</FormLabel>
                <FormControl>
                  <Input  {...field} value={field.value ?? ""} type="number" placeholder="（例）180" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Rate Type Selection */}
        <FormField
          control={form.control}
          name="rateType"
          render={() => (  
            <FormItem className="space-y-3">
              <FormLabel>精算方式</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(value: "upperLower" | "middle") => {
                    setRateType(value);
                    if (value === "upperLower") {
                      form.setValue("middleRate", undefined);
                    } else {
                      form.setValue("upperRate", undefined);
                      form.setValue("lowerRate", undefined);
                    }
                  }}
                  defaultValue="upperLower"
                  className="flex flex-row space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="upperLower" id="upperLower" />
                    <label htmlFor="upperLower">上下割</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="middle" id="middle" />
                    <label htmlFor="middle">中間割</label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Rate fields - conditionally rendered based on rate type */}
        <div className="flex gap-4">
          {rateType === "upperLower" && (
            <>
              <FormField
                control={form.control}
                name="upperRate"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>超過単価（円）</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} type="number" placeholder="（例）5000" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lowerRate"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>控除単価（円）</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} type="number" placeholder="（例）5000" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          {rateType === "middle" && (
            <FormField
              control={form.control}
              name="middleRate"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>中間単価（円）</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} type="number" step="0.01" placeholder="（例）5000" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Daily Work Minutes and Monthly Work Minutes in the same row */}
        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="dailyWorkMinutes"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>1日あたりの作業単位(分)</FormLabel>
                <FormControl>
                  <ComboBox
                    {...field}
                    options={[1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30, 60].map(num => ({
                      value: num.toString(),
                      label: num.toString()
                    }))}
                    placeholder="（例）15"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="monthlyWorkMinutes"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>1ヶ月あたりの作業単位(分)</FormLabel>
                <FormControl>
                  <ComboBox
                    {...field}
                    options={[1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30, 60].map(num => ({
                      value: num.toString(),
                      label: num.toString()
                    }))}
                    placeholder="（例）15"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Basic Start Time, Basic End Time, and Basic Break Duration in the same row */}
        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="basicStartTime"
            render={() => (
              <FormItem className="flex-1">
                <FormLabel>基本開始時刻</FormLabel>
                <TimePickerField
                  control={form.control}
                  hourFieldName="basicStartTimeHour"
                  minuteFieldName="basicStartTimeMinute"
                  minuteStep={form.getValues("dailyWorkMinutes") || 1}
                />  
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="basicEndTime"
            render={() => (
              <FormItem className="flex-1">
                <FormLabel>基本終了時刻</FormLabel>
                <TimePickerField
                  control={form.control}
                  hourFieldName="basicEndTimeHour"
                  minuteFieldName="basicEndTimeMinute"
                  minuteStep={form.getValues("dailyWorkMinutes") || 1}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="basicBreakDuration"
            render={() => (
              <FormItem className="flex-1">
                <FormLabel>基本休憩時間(分)</FormLabel>
                <TimePickerField
                  control={form.control}
                  hourFieldName="basicBreakDurationHour"
                  minuteFieldName="basicBreakDurationMinute"
                  minuteStep={form.getValues("dailyWorkMinutes") || 1}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Closing Day */}
        <FormField
          control={form.control}
          name="closingDay"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>締め日</FormLabel>
              <FormControl>
                <Input  {...field} value={field.value ?? ""} type="number" placeholder="（例）20（未入力の場合は末日）" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" variant="outline" onClick={onCancel}>キャンセル</Button>
          <Button type="submit">{submitButtonText}</Button>
        </div>
      </form>
    </Form>
  );
};

export default function ClientClientDetailsPage({ client, userId }: { client: Client, userId: string }) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [activeContract, setActiveContract] = useState<Contract | null>(null);
  const [activeDialog, setActiveDialog] = useState<DialogType>(null);
  const [error, setError] = useState<{ message: string, date: Date }>({ message: "", date: new Date() });
  const [success, setSuccess] = useState<{ message: string, date: Date }>({ message: "", date: new Date() });
  const { startTransition } = useTransitionContext();
  const router = useRouter();

  // フォームのデフォルト値
  const defaultFormValues: any = {
    userId: userId,
    clientId: client.id,
    name: "",
    startDate: new Date(),
    endDate: undefined as Date | undefined,
    unitPrice: undefined as number | undefined,
    settlementMin: undefined as number | undefined,
    settlementMax: undefined as number | undefined,
    upperRate: undefined as number | undefined,
    middleRate: undefined as number | undefined,
    dailyWorkMinutes: undefined as number | undefined,
    monthlyWorkMinutes: undefined as number | undefined,
    basicStartTime: undefined as string | undefined,
    basicEndTime: undefined as string | undefined,
    basicBreakDuration: undefined as number | undefined,
    closingDay: undefined as number | undefined,
  };

  // 契約作成フォーム
  const createForm = useForm<z.infer<typeof ContractSchema>>({
    resolver: zodResolver(ContractSchema),
    defaultValues: defaultFormValues,
  });

  // 編集フォーム
  const editForm = useForm<z.infer<typeof ContractSchema>>({
    resolver: zodResolver(ContractSchema),
    defaultValues: defaultFormValues,
  });

  // 初期データ読み込み
  useEffect(() => {
    startTransition(async () => {
      await refreshContracts();
    });
  }, [client]);

  // 契約情報を更新する
  const refreshContracts = async () => {
    try {
      const jsonData = await getContractsByClientIdAction(client.id);
      if (jsonData) {
        // 念のための保険：クライアント側でも変換処理を行う
        const data = JSON.parse(JSON.stringify(jsonData));
        setContracts(data.map((contract: Contract) => ({
          ...contract,
        })));
      }
    } catch (error) {
      console.error(error);
    }
  };

  // ダイアログを閉じる
  const closeDialog = () => {
    setActiveDialog(null);
    setActiveContract(null);
  };

  // 契約詳細ダイアログを開く
  const openDetailsDialog = (contract: Contract) => {
    setActiveContract(contract);
    setActiveDialog("details");
  };

  // 契約作成
  const onCreateContract = (data: any) => {
    startTransition(async () => {
      try {
        await createContractAction(data);
        setSuccess({ message: `契約 '${data.name}' を作成しました`, date: new Date() });
        createForm.reset(defaultFormValues);
        closeDialog();
        await refreshContracts();
      } catch (err) {
        console.error(err);
        setError({ message: "契約の作成に失敗しました", date: new Date() });
      }
    });
  };

  // 契約編集
  const onEditContract = (data: any) => {
    if (!activeContract) return;
    startTransition(async () => {
      try {
        await updateContractAction(activeContract.id, { ...data });
        setSuccess({ message: `契約 '${data.name}' を編集しました`, date: new Date() });
        closeDialog();
        editForm.reset(defaultFormValues);
        await refreshContracts();
      } catch (err) {
        console.error(err);
        setError({ message: "契約の更新に失敗しました", date: new Date() });
      }
    });
  };

  // 契約削除
  const onDeleteContract = () => {
    if (!activeContract) return;
    startTransition(async () => {
      try {
        await deleteContractAction(activeContract.id);
        setSuccess({ message: `契約 '${activeContract.name}' を削除しました`, date: new Date() });
        closeDialog();
        await refreshContracts();
      } catch (err) {
        console.error(err);
        setError({ message: "契約の削除に失敗しました。関連する勤怠情報が存在する可能性があります。", date: new Date() });
      }
    });
  };

  const handleNavigation = (url: string) => {
    startTransition(() => {
      router.push(url);
    });
  };

  // 編集ダイアログが開かれたときのフォーム初期化
  useEffect(() => {
    if (activeDialog === "edit" && activeContract) {
      editForm.reset({
        userId: userId,
        clientId: client.id,
        name: activeContract.name,
        startDate: activeContract.startDate,
        endDate: activeContract.endDate,
        unitPrice: activeContract.unitPrice,
        settlementMin: activeContract.settlementMin,
        settlementMax: activeContract.settlementMax,
        upperRate: activeContract.upperRate,
        lowerRate: activeContract.lowerRate,
        middleRate: activeContract.middleRate,
        dailyWorkMinutes: activeContract.dailyWorkMinutes,
        monthlyWorkMinutes: activeContract.monthlyWorkMinutes,
        basicStartTime: activeContract.basicStartTime,
        basicEndTime: activeContract.basicEndTime,
        basicBreakDuration: activeContract.basicBreakDuration,
        closingDay: activeContract.closingDay,
      });
    }
  }, [activeDialog, activeContract, editForm]);

  return (
    <div className="p-6 space-y-6 relative">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{client.name}</h1>
        <Button variant="outline" onClick={() => handleNavigation("/client")}>
          戻る
        </Button>
      </div>

      {error && <div className="mb-4"><FormError message={error.message} resetSignal={error.date.getTime()} /></div>}
      {success && <div className="mb-4"><FormSuccess message={success.message} resetSignal={success.date.getTime()} /></div>}

      <Card>
        <CardHeader>
          <CardTitle>契約情報</CardTitle>
        </CardHeader>
        <CardContent>
          {contracts.length === 0 ? (
            <div className="text-center p-4">
              <p className="text-muted-foreground">契約情報がありません</p>
            </div>
          ) : (
            <div className="space-y-4">
              {contracts.map((contract) => (
                <div
                  key={contract.id}
                  className="p-3 border rounded-md flex justify-between items-center gap-4"
                >
                  <div className="cursor-pointer hover:text-blue-500" onClick={() => handleNavigation(`/contract/${contract.id}`)}>
                    <div className="font-medium">{contract.name}</div>
                    <div className="text-sm text-muted-foreground">
                      期間: {new Date(contract.startDate).toLocaleDateString()} ~
                      {contract.endDate
                        ? new Date(contract.endDate).toLocaleDateString()
                        : ""}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button variant="outline" size="sm" onClick={() => openDetailsDialog(contract)}>詳細</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => setActiveDialog("create")}>契約を作成</Button>
      </div>

      <Dialog
        open={activeDialog === "details"}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      >
        <DialogPortal>
          <DialogOverlay />
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>契約詳細</DialogTitle>
            </DialogHeader>
            {activeContract && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">基本情報</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="font-semibold">契約名</div>
                    <div>{activeContract.name}</div>
                    <div className="font-semibold">開始日</div>
                    <div>{new Date(activeContract.startDate).toLocaleDateString()}</div>
                    <div className="font-semibold">終了日</div>
                    <div>{activeContract.endDate ? new Date(activeContract.endDate).toLocaleDateString() : 'なし'}</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">精算情報</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="font-semibold">単価</div>
                    <div>{activeContract.unitPrice ? `${activeContract.unitPrice}円` : 'なし'}</div>
                    <div className="font-semibold">精算下限</div>
                    <div>{activeContract.settlementMin ? `${activeContract.settlementMin}時間` : 'なし'}</div>
                    <div className="font-semibold">精算上限</div>
                    <div>{activeContract.settlementMax ? `${activeContract.settlementMax}時間` : 'なし'}</div>
                    <div className="font-semibold">超過単価</div>
                    <div>{activeContract.upperRate ? `${activeContract.upperRate}円` : 'なし'}</div>
                    <div className="font-semibold">控除単価</div>
                    <div>{activeContract.lowerRate ? `${activeContract.lowerRate}円` : 'なし'}</div>
                    <div className="font-semibold">中間単価</div>
                    <div>{activeContract.middleRate ? `${activeContract.middleRate}円` : 'なし'}</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">勤務設定</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="font-semibold">1日あたりの作業単位</div>
                    <div>{activeContract.dailyWorkMinutes ? `${activeContract.dailyWorkMinutes}分` : 'なし'}</div>
                    <div className="font-semibold">1ヶ月あたりの作業単位</div>
                    <div>{activeContract.monthlyWorkMinutes ? `${activeContract.monthlyWorkMinutes}分` : 'なし'}</div>
                    <div className="font-semibold">基本開始時刻</div>
                    <div>{activeContract.basicStartTime || 'なし'}</div>
                    <div className="font-semibold">基本終了時刻</div>
                    <div>{activeContract.basicEndTime || 'なし'}</div>
                    <div className="font-semibold">基本休憩時間</div>
                    <div>{activeContract.basicBreakDuration ? `${activeContract.basicBreakDuration}分` : 'なし'}</div>
                    <div className="font-semibold">締め日</div>
                    <div>{activeContract.closingDay ? `${activeContract.closingDay}日` : '末日'}</div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setActiveDialog("edit")}>編集</Button>
                  <Button variant="destructive" onClick={() => setActiveDialog("delete")}>削除</Button>
                  <Button variant="outline" onClick={closeDialog}>閉じる</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </DialogPortal>
      </Dialog>

      <Dialog
        open={activeDialog === "create"}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      >
        <DialogPortal>
          <DialogOverlay />
          <DialogContent className="max-h-[90vh] w-[95vw] max-w-[1400px] overflow-y-auto p-8">
            <DialogHeader>
              <DialogTitle>契約を作成</DialogTitle>
            </DialogHeader>
            <ContractForm
              form={createForm}
              onSubmit={onCreateContract}
              onCancel={closeDialog}
              submitButtonText="作成"
            />
          </DialogContent>
        </DialogPortal>
      </Dialog>

      <Dialog
        open={activeDialog === "edit"}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      >
        <DialogPortal>
          <DialogOverlay />
          <DialogContent className="max-h-[90vh] w-[95vw] max-w-[1400px] overflow-y-auto p-8">
            <DialogHeader>
              <DialogTitle>契約を編集</DialogTitle>
            </DialogHeader>
            <ContractForm
              form={editForm}
              onSubmit={onEditContract}
              onCancel={closeDialog}
              submitButtonText="更新"
            />
          </DialogContent>
        </DialogPortal>
      </Dialog>

      <Dialog
        open={activeDialog === "delete"}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      >
        <DialogPortal>
          <DialogOverlay />
          <DialogContent>

            <DialogHeader>
              <DialogTitle>契約の削除確認</DialogTitle>
            </DialogHeader>
            <div>
              <p>本当に契約 "{activeContract?.name}" を削除しますか？</p>
              <p className="text-sm text-gray-500 mt-2">この操作は元に戻すことができません。</p>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={closeDialog}>キャンセル</Button>
              <Button variant="destructive" onClick={onDeleteContract}>削除</Button>
            </div>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </div>
  );
} 
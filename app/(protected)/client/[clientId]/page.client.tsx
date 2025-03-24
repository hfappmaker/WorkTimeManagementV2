"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogOverlay, DialogPortal, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DatePickerField } from "@/components/ui/date-picker";
import FormError from "@/components/form-error";
import FormSuccess from "@/components/form-success";
import { Form, FormItem, FormLabel, FormControl, FormMessage, FormField } from "@/components/ui/form";
import { createContractAction, deleteContractAction, updateContractAction, getContractsByClientIdAction } from '@/actions/contract';
import { useTransitionContext } from "@/contexts/TransitionContext";
import { z } from "zod";
import { ComboBoxField } from "@/components/ui/select";
import { TimePickerFieldForDate, TimePickerFieldForNumber } from "@/components/ui/time-picker";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { NumberInputField } from "@/components/ui/input";
import { Client } from "@/types/client";
import { Contract } from "@/types/contract";

type ContractFormValues = z.infer<typeof contractFormSchema>;

interface ContractFormProps {
  defaultValues?: ContractFormValues;
  onSubmit: (values: ContractFormValues) => Promise<void>;
  onCancel: () => void;
  submitButtonText: string;
}

type DialogType = "create" | "edit" | "delete" | "details" | null;

const ContractDialog = ({ 
  type, 
  isOpen, 
  onClose, 
  children 
}: { 
  type: DialogType;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) => (
  <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
    <DialogPortal>
      <DialogOverlay />
      <DialogContent className="max-h-[90vh] w-[95vw] max-w-[1400px] overflow-y-auto p-8">
        <DialogHeader>
          <DialogTitle>
            {type === "create" && "契約を作成"}
            {type === "edit" && "契約を編集"}
            {type === "delete" && "契約の削除確認"}
            {type === "details" && "契約詳細"}
          </DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </DialogPortal>
  </Dialog>
);

const contractFormSchema = z.object({
  name: z.string().min(1, "契約名は必須です"),
  startDate: z.date(),
  endDate: z.date().optional(),
  unitPrice: z.number().optional(),
  settlementMin: z.number().optional(),
  settlementMax: z.number().optional(),
  rateType: z.enum(["upperLower", "middle"]).default("upperLower"),
  upperRate: z.number().optional(),
  lowerRate: z.number().optional(),
  middleRate: z.number().optional(),
  dailyWorkMinutes: z.number().optional(),
  monthlyWorkMinutes: z.number().optional(),
  basicStartTime: z.date().optional(),
  basicEndTime: z.date().optional(),
  basicBreakDuration: z.number().optional(),
  closingDay: z.number().optional(),
});

const ContractForm = ({ defaultValues, onSubmit, onCancel, submitButtonText }: ContractFormProps) => {
  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractFormSchema),
    defaultValues: defaultValues || {
      name: "",
      startDate: new Date(),
      endDate: undefined,
      unitPrice: undefined,
      settlementMin: undefined,
      settlementMax: undefined,
      rateType: "upperLower" as const,
      upperRate: undefined,
      lowerRate: undefined,
      middleRate: undefined,
      dailyWorkMinutes: 15,
      monthlyWorkMinutes: 15,
      basicStartTime: undefined,
      basicEndTime: undefined,
      basicBreakDuration: undefined,
      closingDay: undefined,
    },
  });

  // rateTypeの状態をformの値から取得
  const rateType = form.watch("rateType");

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
          <DatePickerField
            control={form.control}
            name="startDate"
            label="開始日"
            placeholder="開始日を選択"
          />
          <DatePickerField
            control={form.control}
            name="endDate"
            label="終了日"
            placeholder="終了日を選択（任意）"
          />
        </div>

        {/* Unit Price, Settlement Min, Settlement Max in the same row */}
        <div className="flex gap-4">
          <NumberInputField
            control={form.control}
            name="unitPrice"
            label="単価（円）"
            placeholder="（例）500000"
          />

          <NumberInputField
            control={form.control}
            name="settlementMin"
            label="精算下限（時間）"
            placeholder="（例）140"
          />

          <NumberInputField
            control={form.control}
            name="settlementMax"
            label="精算上限（時間）"
            placeholder="（例）180"
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
                    form.setValue("rateType", value);
                  }}
                  defaultValue={form.getValues("rateType")}
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
              <NumberInputField
                control={form.control}
                name="upperRate"
                label="超過単価（円）"
                placeholder="（例）5000"
              />

              <NumberInputField
                control={form.control}
                name="lowerRate"
                label="控除単価（円）"
                placeholder="（例）5000"
              />
            </>
          )}

          {rateType === "middle" && (
            <NumberInputField
              control={form.control}
              name="middleRate"
              label="中間単価（円）"
              placeholder="（例）5000"
            />
          )}
        </div>

        {/* Daily Work Minutes and Monthly Work Minutes in the same row */}
        <div className="flex gap-4">
          <ComboBoxField
            control={form.control}
            name="dailyWorkMinutes"
            options={[1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30, 60].map(num => ({
              value: num,
              label: num.toString()
            }))}
            placeholder="（例）15"
            label="1日あたりの作業単位(分)"
          />

          <ComboBoxField
            control={form.control}
            name="monthlyWorkMinutes"
            options={[1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30, 60].map(num => ({
              value: num,
              label: num.toString()
            }))}
            placeholder="（例）15"
            label="1ヶ月あたりの作業単位(分)"
          />
        </div>

        {/* Basic Start Time, Basic End Time, and Basic Break Duration in the same row */}
        <div className="flex gap-4">
          <TimePickerFieldForDate
            control={form.control}
            name="basicStartTime"
            minuteStep={form.getValues("dailyWorkMinutes") || 1}
            label="基本開始時刻"
          />

          <TimePickerFieldForDate
            control={form.control}
            name="basicEndTime"
            minuteStep={form.getValues("dailyWorkMinutes") || 1}
            label="基本終了時刻"
          />

          <TimePickerFieldForNumber
            control={form.control}
            name="basicBreakDuration"
            minuteStep={form.getValues("dailyWorkMinutes") || 1}
            label="基本休憩時間(分)"
          />
        </div>

        {/* Closing Day */}
        <NumberInputField
          control={form.control}
          name="closingDay"
          label="締め日"
          placeholder="（例）20（未入力の場合は末日）"
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
  const onCreateContract = async (data: ContractFormValues) => {
    startTransition(async () => {
      try {
        const contractData = convertContractFormValuesToContract(data, userId, client.id);
        await createContractAction(contractData);
        setSuccess({ message: `契約 '${data.name}' を作成しました`, date: new Date() });
        closeDialog();
        await refreshContracts();
      } catch (err) {
        console.error(err);
        setError({ message: "契約の作成に失敗しました", date: new Date() });
      }
    });
  };

  // 契約編集
  const onEditContract = async (data: ContractFormValues) => {
    if (!activeContract) return;
    startTransition(async () => {
      try {
        const contractData = convertContractFormValuesToContract(data, userId, client.id);
        await updateContractAction(activeContract.id, contractData);
        setSuccess({ message: `契約 '${data.name}' を編集しました`, date: new Date() });
        closeDialog();
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

  // 契約データを変換する関数
  const convertContractFormValuesToContract = (data: ContractFormValues, userId: string, clientId: string): Omit<Contract, 'id'> => {
    return {
      ...data,
      endDate: data.endDate || undefined,
      unitPrice: data.unitPrice || undefined,
      settlementMin: data.settlementMin || undefined,
      settlementMax: data.settlementMax || undefined,
      upperRate: data.upperRate || undefined,
      lowerRate: data.lowerRate || undefined,
      middleRate: data.middleRate || undefined,
      dailyWorkMinutes: data.dailyWorkMinutes || undefined,
      monthlyWorkMinutes: data.monthlyWorkMinutes || undefined,
      basicStartTime: data.basicStartTime || undefined,
      basicEndTime: data.basicEndTime || undefined,
      basicBreakDuration: data.basicBreakDuration || undefined,
      closingDay: data.closingDay || undefined,
      userId,
      clientId,
    };
  };

  // Contract型からContractFormValues型への変換関数を追加
  const convertContractToFormValues = (contract: Contract): ContractFormValues => {
    return {
      name: contract.name,
      startDate: new Date(contract.startDate),
      endDate: contract.endDate ? new Date(contract.endDate) : undefined,
      unitPrice: contract.unitPrice ? Number(contract.unitPrice) : undefined,
      settlementMin: contract.settlementMin ? Number(contract.settlementMin) : undefined,
      settlementMax: contract.settlementMax ? Number(contract.settlementMax) : undefined,
      rateType: contract.rateType,
      upperRate: contract.upperRate ? Number(contract.upperRate) : undefined,
      lowerRate: contract.lowerRate ? Number(contract.lowerRate) : undefined,
      middleRate: contract.middleRate ? Number(contract.middleRate) : undefined,
      dailyWorkMinutes: contract.dailyWorkMinutes || undefined,
      monthlyWorkMinutes: contract.monthlyWorkMinutes || undefined,
      basicStartTime: contract.basicStartTime ? new Date(contract.basicStartTime) : undefined,
      basicEndTime: contract.basicEndTime ? new Date(contract.basicEndTime) : undefined,
      basicBreakDuration: contract.basicBreakDuration || undefined,
      closingDay: contract.closingDay || undefined,
    };
  };

  return (
    <div className="p-6 space-y-6">
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
                      期間: {new Date(contract.startDate).toLocaleDateString()} ~ {contract.endDate
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

      <ContractDialog
        type="details"
        isOpen={activeDialog === "details"}
        onClose={closeDialog}
      >
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
                <div>{activeContract.basicStartTime ? new Date(activeContract.basicStartTime).toLocaleTimeString('en-US', { timeZone: 'UTC', hour12: false, hour: '2-digit', minute: '2-digit' }) : 'なし'}</div>
                <div className="font-semibold">基本終了時刻</div>
                <div>{activeContract.basicEndTime ? new Date(activeContract.basicEndTime).toLocaleTimeString('en-US', { timeZone: 'UTC', hour12: false, hour: '2-digit', minute: '2-digit' }) : 'なし'}</div>
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
      </ContractDialog>

      <ContractDialog
        type="create"
        isOpen={activeDialog === "create"}
        onClose={closeDialog}
      >
        <ContractForm
          defaultValues={undefined}
          onSubmit={onCreateContract}
          onCancel={closeDialog}
          submitButtonText="作成"
        />
      </ContractDialog>

      <ContractDialog
        type="edit"
        isOpen={activeDialog === "edit"}
        onClose={closeDialog}
      >
        <ContractForm
          defaultValues={activeContract ? convertContractToFormValues(activeContract) : undefined}
          onSubmit={onEditContract}
          onCancel={closeDialog}
          submitButtonText="更新"
        />
      </ContractDialog>

      <ContractDialog
        type="delete"
        isOpen={activeDialog === "delete"}
        onClose={closeDialog}
      >
        <div>
          <p>本当に契約 "{activeContract?.name}" を削除しますか？</p>
          <p className="text-sm text-gray-500 mt-2">この操作は元に戻すことができません。</p>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={closeDialog}>キャンセル</Button>
          <Button variant="destructive" onClick={onDeleteContract}>削除</Button>
        </div>
      </ContractDialog>
    </div>
  );
} 
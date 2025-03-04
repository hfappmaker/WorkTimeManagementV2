'use client';

import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from "@/components/ui/button";
import { truncate } from "@/lib/utils";
import ModalDialog from "@/components/ModalDialog";
import { createContractAction, 
  deleteContractAction, 
  getContractsByUserIdAction, 
  updateContractAction } from '@/actions/formAction';
import { ContractSchema } from '@/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DateInput } from "@/components/ui/date-input";
import { useIsClient } from "@/hooks/use-is-client";
import { useTransition } from 'react';
import { z } from 'zod';
import LoadingOverlay from '@/components/LoadingOverlay';
import FormError from '@/components/form-error';
import FormSuccess from '@/components/form-success';
import { useForm, UseFormReturn } from "react-hook-form";
import { User } from "@prisma/client";
import { useRouter } from 'next/navigation';

// 型定義
type Contract = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date | null;
  unitPrice: string | null;
  settlementMin: string | null;
  settlementMax: string | null;
  upperRate: string | null;
  middleRate: string | null;
  userId: string;
  userName: string | null;
  closingDay: string | null;
};

type DialogType = "create" | "edit" | "delete" | "details" | null;

interface DashboardClientProps {
  user: User;
}

// ヘルパー関数：契約データの変換
const formatContract = (contract: any): Contract => ({
  ...contract,
  startDate: new Date(contract.startDate),
  endDate: contract.endDate ? new Date(contract.endDate) : null,
  unitPrice: contract.unitPrice?.toString() || null,
  settlementMin: contract.settlementMin?.toString() || null,
  settlementMax: contract.settlementMax?.toString() || null,
  upperRate: contract.upperRate?.toString() || null,
  middleRate: contract.middleRate?.toString() || null,
  userName: null,
  closingDay: contract.closingDay?.toString() || null,
});

// 共通のContractFormコンポーネント
type ContractFormProps = {
  form: UseFormReturn<z.infer<typeof ContractSchema>>;
  onSubmit: (data: z.infer<typeof ContractSchema>) => void;
  onCancel: () => void;
  submitButtonText: string;
};

const ContractForm = ({ form, onSubmit, onCancel, submitButtonText }: ContractFormProps) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Contract Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>契約名</FormLabel>
              <FormControl>
                <Input {...field} placeholder="契約名を入力" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Start Date */}
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>開始日</FormLabel>
              <FormControl>
                <DateInput
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* End Date (Optional) */}
        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>終了日</FormLabel>
              <FormControl>
                <DateInput
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="終了日を選択（任意）"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Unit Price */}
        <FormField
          control={form.control}
          name="unitPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>単価</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ""} type="number" placeholder="e.g. 5000" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Settlement Min */}
        <FormField
          control={form.control}
          name="settlementMin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>精算下限</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ""} type="number" placeholder="e.g. 100000" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Settlement Max */}
        <FormField
          control={form.control}
          name="settlementMax"
          render={({ field }) => (
            <FormItem>
              <FormLabel>精算上限</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ""} type="number" placeholder="e.g. 500000" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Upper Rate */}
        <FormField
          control={form.control}
          name="upperRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>上限レート</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ""} type="number" step="0.01" placeholder="e.g. 1.5" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Middle Rate */}
        <FormField
          control={form.control}
          name="middleRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>中間レート</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ""} type="number" step="0.01" placeholder="e.g. 1.0" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Closing Day */}
        <FormField
          control={form.control}
          name="closingDay"
          render={({ field }) => (
            <FormItem>
              <FormLabel>締め日</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ""} type="number" placeholder="e.g. 1" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            キャンセル
          </Button>
          <Button type="submit">{submitButtonText}</Button>
        </div>
      </form>
    </Form>
  );
};

export default function DashboardClient({ user }: DashboardClientProps) {
  // 状態管理
  const [activeContract, setActiveContract] = useState<Contract | null>(null);
  const [activeDialog, setActiveDialog] = useState<DialogType>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const isClient = useIsClient();
  const [isPending, startTransition] = useTransition();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const router = useRouter();

  // ダイアログ管理
  const closeDialog = () => {
    setActiveDialog(null);
    setActiveContract(null);
  };

  const openDetailsDialog = (contract: Contract) => {
    setActiveContract(contract);
    setActiveDialog("details");
  };

  // 契約リストの更新
  const refreshContracts = async () => {
    const updatedContracts = await getContractsByUserIdAction(user.id ?? "");
    setContracts(updatedContracts.map(formatContract));
  };

  // フォーム初期値
  const defaultFormValues = {
    userId: user.id,
    name: "",
    startDate: new Date(),
    endDate: undefined,
    unitPrice: "",
    settlementMin: "",
    settlementMax: "",
    upperRate: "",
    middleRate: "",
    closingDay: undefined,
  };

  // Create用フォーム
  const createForm = useForm<z.infer<typeof ContractSchema>>({
    resolver: zodResolver(ContractSchema),
    defaultValues: defaultFormValues,
  });

  // Edit用フォーム
  const editForm = useForm<z.infer<typeof ContractSchema>>({
    resolver: zodResolver(ContractSchema),
    defaultValues: defaultFormValues,
  });

  // 編集ダイアログが開かれたときのフォーム初期化
  useEffect(() => {
    if (activeDialog === "edit" && activeContract) {
      editForm.reset({
        userId: activeContract.userId,
        name: activeContract.name,
        startDate: activeContract.startDate ? new Date(activeContract.startDate) : new Date(),
        endDate: activeContract.endDate ? new Date(activeContract.endDate) : undefined,
        unitPrice: activeContract.unitPrice || "",
        settlementMin: activeContract.settlementMin || "",
        settlementMax: activeContract.settlementMax || "",
        upperRate: activeContract.upperRate || "",
        middleRate: activeContract.middleRate || "",
        closingDay: activeContract.closingDay || undefined,
      });
    }
  }, [activeDialog, activeContract, editForm]);

  // 初期データ読み込み
  useEffect(() => {
    startTransition(async () => {
      await refreshContracts();
    });
  }, []);

  // 契約作成処理
  const onCreateContract = (data: z.infer<typeof ContractSchema>) => {
    startTransition(async () => {
      try {
        await createContractAction({ ...data, userId: user.id });
        setSuccess(`契約 '${truncate(data.name, 20)}' を作成しました`);
        createForm.reset(defaultFormValues);
        closeDialog();
        await refreshContracts();
      } catch (err) {
        console.error(err);
        setError("契約の作成に失敗しました");
      }
    });
  };

  // 契約編集処理
  const onEditContract = (data: z.infer<typeof ContractSchema>) => {
    if (!activeContract) return;

    startTransition(async () => {
      try {
        await updateContractAction(activeContract.id, { ...data, userId: user.id });
        setSuccess("契約を編集しました");
        closeDialog();
        editForm.reset(defaultFormValues);
        await refreshContracts();
      } catch (err) {
        console.error(err);
        setError("契約の更新に失敗しました");
      }
    });
  };

  // 契約削除処理
  const onDeleteContract = () => {
    if (!activeContract) return;
    startTransition(async () => {
      try {
        await deleteContractAction(activeContract.id);
        setSuccess("契約を削除しました");
        closeDialog();
        await refreshContracts();
      } catch (err) {
        console.error(err);
        setError("契約の削除に失敗しました。関連する勤怠情報が存在する可能性があります。");
      }
    });
  };

  // Link クリック時の遷移処理
  const handleNavigation = (contractId: string) => {
    startTransition(() => {
      router.push(`/workReport/${contractId}`);
    });
  };

  return (
    <LoadingOverlay isClient={isClient} isPending={isPending}>
      {error && <FormError message={error} />}
      {success && <FormSuccess message={success} />}
      <div className="p-4">
        {contracts.length === 0 ? (
          <p>契約がありません。</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {contracts.map((contract) => (
              <li
                key={contract.id}
                className="py-4"
              >
                <div className="flex justify-between items-center">
                  <div className="flex flex-col cursor-pointer hover:text-blue-500"
                    onClick={(e) => handleNavigation(contract.id)}>
                    <Label className="truncate max-w-[300px]">
                      {truncate(contract.name, 30)}
                    </Label>
                    <div className="self-end text-right text-xs mt-1 flex justify-end">
                      <span className="font-semibold">開始日:</span>{' '}
                      {contract.startDate.toLocaleDateString('ja-JP')}
                      <span className="font-semibold ml-2">終了日:</span>{' '}
                      {contract.endDate ? contract.endDate.toLocaleDateString('ja-JP') : 'N/A'}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-4"
                    onClick={(e) => {
                      e.preventDefault();
                      openDetailsDialog(contract);
                    }}
                  >
                    詳細
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <Button onClick={() => setActiveDialog("create")} className="ml-auto">
          契約を作成
        </Button>
        {/* 契約詳細モーダル */}
        <ModalDialog isOpen={activeDialog === "details"} title="契約詳細">
          {activeContract && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">基本情報</h3>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="font-semibold">契約名</div>
                  <div>{activeContract.name}</div>
                  <div className="font-semibold">開始日</div>
                  <div>{activeContract.startDate.toLocaleDateString('ja-JP')}</div>
                  <div className="font-semibold">終了日</div>
                  <div>{activeContract.endDate ? activeContract.endDate.toLocaleDateString('ja-JP') : 'なし'}</div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium">単価・精算情報</h3>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="font-semibold">単価</div>
                  <div>{activeContract.unitPrice ? `¥${activeContract.unitPrice}` : 'なし'}</div>
                  <div className="font-semibold">精算下限</div>
                  <div>{activeContract.settlementMin ? `¥${activeContract.settlementMin}` : 'なし'}</div>
                  <div className="font-semibold">精算上限</div>
                  <div>{activeContract.settlementMax ? `¥${activeContract.settlementMax}` : 'なし'}</div>
                  <div className="font-semibold">上限レート</div>
                  <div>{activeContract.upperRate || 'なし'}</div>
                  <div className="font-semibold">中間レート</div>
                  <div>{activeContract.middleRate || 'なし'}</div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setActiveDialog("edit")}>
                  編集
                </Button>
                <Button variant="outline" onClick={closeDialog}>
                  閉じる
                </Button>
              </div>
            </div>
          )}
        </ModalDialog>

        {/* Create Dialog */}
        <ModalDialog isOpen={activeDialog === "create"} title="契約を作成">
          <ContractForm
            form={createForm}
            onSubmit={onCreateContract}
            onCancel={closeDialog}
            submitButtonText="作成"
          />
        </ModalDialog>

        {/* Edit Dialog */}
        <ModalDialog isOpen={activeDialog === "edit"} title="契約を編集">
          <ContractForm
            form={editForm}
            onSubmit={onEditContract}
            onCancel={closeDialog}
            submitButtonText="更新"
          />
        </ModalDialog>

        {/* Delete Confirmation Dialog */}
        <ModalDialog isOpen={activeDialog === "delete"} title="Delete Contract">
          <div>
            <p>本当に契約 "{activeContract?.name}" を削除しますか？</p>
            <p className="text-sm text-gray-500 mt-2">この操作は元に戻すことができません。</p>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={closeDialog}>
              キャンセル
            </Button>
            <Button variant="destructive" onClick={onDeleteContract}>
              削除
            </Button>
          </div>
        </ModalDialog>
      </div>
    </LoadingOverlay>
  );
} 
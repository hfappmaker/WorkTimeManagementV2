"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogOverlay, DialogPortal, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DateInput } from "@/components/ui/date-input";
import LoadingOverlay from "@/components/LoadingOverlay";
import FormError from "@/components/form-error";
import FormSuccess from "@/components/form-success";
import { Form, FormItem, FormLabel, FormControl, FormMessage, FormField } from "@/components/ui/form";
import { createContractAction, deleteContractAction, updateContractAction, getClientByIdAction, getContractsByClientIdAction } from '@/actions/formAction';
import { ContractSchema } from '@/schemas';
import { useIsClient } from "@/hooks/use-is-client";
import { z } from "zod";

interface Contract {
  id: string;
  name: string;
  startDate: string;
  endDate: string | null;
  unitPrice: string;
  settlementMin: string;
  settlementMax: string;
  upperRate: string;
  middleRate: string;
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
                <Input {...field} value={field.value ?? ""} placeholder="契約名を入力" />
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

        {/* End Date */}
        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>終了日</FormLabel>
              <FormControl>
                <DateInput
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

        {/* Unit Price */}
        <FormField
          control={form.control}
          name="unitPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>単価</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ""} type="number" placeholder="（例）5000" />
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
                <Input  {...field} value={field.value ?? ""} type="number" placeholder="（例）140" />
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
                <Input  {...field} value={field.value ?? ""} type="number" placeholder="（例）180" />
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
              <FormLabel>超過単価</FormLabel>
              <FormControl>
                <Input  {...field} value={field.value ?? ""} type="number" placeholder="（例）5000" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Lower Rate */}
        <FormField
          control={form.control}
          name="lowerRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>控除単価</FormLabel>
              <FormControl>
                <Input  {...field} value={field.value ?? ""} type="number" placeholder="（例）5000" />
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
              <FormLabel>中間単価</FormLabel>
              <FormControl>
                <Input  {...field} value={field.value ?? ""} type="number" step="0.01" placeholder="（例）5000" />
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
                <Input  {...field} value={field.value ?? ""} type="number" placeholder="（例）20（末日の場合は0を入力）" />
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

export default function ClientDetailsClient({ client, userId }: { client: Client, userId: string }) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [activeContract, setActiveContract] = useState<Contract | null>(null);
  const [activeDialog, setActiveDialog] = useState<DialogType>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();
  const isClient = useIsClient();
  const router = useRouter();

  // フォームのデフォルト値
  const defaultFormValues: any = {
    userId: userId,
    clientId: client.id,
    name: "",
    startDate: new Date(),
    endDate: undefined as Date | undefined,
    unitPrice: "",
    settlementMin: "",
    settlementMax: "",
    upperRate: "",
    middleRate: "",
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
          startDate: contract.startDate.toString(),
          endDate: contract.endDate ? contract.endDate.toString() : null
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
        await createContractAction({ ...data, clientId: client.id });
        setSuccess(`契約 '${data.name}' を作成しました`);
        createForm.reset(defaultFormValues);
        closeDialog();
        await refreshContracts();
      } catch (err) {
        console.error(err);
        setError("契約の作成に失敗しました");
      }
    });
  };

  // 契約編集
  const onEditContract = (data: any) => {
    if (!activeContract) return;
    startTransition(async () => {
      try {
        await updateContractAction(activeContract.id, { ...data, clientId: client.id });
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

  // 契約削除
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

  // 編集ダイアログが開かれたときのフォーム初期化
  useEffect(() => {
    if (activeDialog === "edit" && activeContract) {
      editForm.reset({
        name: activeContract.name,
        startDate: new Date(activeContract.startDate),
        endDate: activeContract.endDate ? new Date(activeContract.endDate) : undefined,
        unitPrice: activeContract.unitPrice,
        settlementMin: activeContract.settlementMin,
        settlementMax: activeContract.settlementMax,
        upperRate: activeContract.upperRate,
        middleRate: activeContract.middleRate,
        closingDay: activeContract.closingDay ? activeContract.closingDay.toString() : null,
      });
    }
  }, [activeDialog, activeContract, editForm]);

  return (
    <div className="p-6 space-y-6 relative">
      <LoadingOverlay isClient={isClient} isPending={isPending}>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{client.name}</h1>
          <Button variant="outline" onClick={() => router.push("/client")}>
            戻る
          </Button>
        </div>

        {error && <div className="mb-4"><FormError message={error} /></div>}
        {success && <div className="mb-4"><FormSuccess message={success} /></div>}

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
                    className="p-3 border rounded-md flex justify-between items-center"
                  >
                    <div className="cursor-pointer hover:text-blue-500" onClick={() => openDetailsDialog(contract)}>
                      <div className="font-medium">{contract.name}</div>
                      <div className="text-sm text-muted-foreground">
                        期間: {new Date(contract.startDate).toLocaleDateString()} ~
                        {contract.endDate
                          ? new Date(contract.endDate).toLocaleDateString()
                          : ""}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => {
                        setActiveContract(contract);
                        setActiveDialog("edit");
                      }}>編集</Button>
                      <Button variant="destructive" size="sm" onClick={() => {
                        setActiveContract(contract);
                        setActiveDialog("delete");
                      }}>削除</Button>
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
            <DialogContent>
              <LoadingOverlay isClient={isClient} isPending={isPending}>
                <DialogHeader>
                  <DialogTitle>契約詳細</DialogTitle>
                </DialogHeader>
                {activeContract && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">基本情報</h3>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="font-semibold">契約名</div>
                        <div>{activeContract.name}</div>
                        <div className="font-semibold">開始日</div>
                        <div>{new Date(activeContract.startDate).toLocaleDateString()}</div>
                        <div className="font-semibold">終了日</div>
                        <div>{activeContract.endDate ? new Date(activeContract.endDate).toLocaleDateString() : 'なし'}</div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" onClick={() => setActiveDialog("edit")}>編集</Button>
                      <Button variant="outline" onClick={closeDialog}>閉じる</Button>
                    </div>
                  </div>
                )}
              </LoadingOverlay>
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
            <DialogContent>
              <LoadingOverlay isClient={isClient} isPending={isPending}>
                <DialogHeader>
                  <DialogTitle>契約を作成</DialogTitle>
                </DialogHeader>
                <ContractForm
                  form={createForm}
                  onSubmit={onCreateContract}
                  onCancel={closeDialog}
                  submitButtonText="作成"
                />
              </LoadingOverlay>
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
            <DialogContent>
              <LoadingOverlay isClient={isClient} isPending={isPending}>
                <DialogHeader>
                  <DialogTitle>契約を編集</DialogTitle>
                </DialogHeader>
                <ContractForm
                  form={editForm}
                  onSubmit={onEditContract}
                  onCancel={closeDialog}
                  submitButtonText="更新"
                />
              </LoadingOverlay>
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
              <LoadingOverlay isClient={isClient} isPending={isPending}>

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
              </LoadingOverlay>
            </DialogContent>
          </DialogPortal>
        </Dialog>
      </LoadingOverlay>
    </div>
  );
} 
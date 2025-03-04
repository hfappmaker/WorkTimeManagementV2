"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DateInput } from "@/components/ui/date-input";
import LoadingOverlay from "@/components/LoadingOverlay";
import FormError from "@/components/form-error";
import FormSuccess from "@/components/form-success";
import { Form, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { createContractAction, deleteContractAction, updateContractAction, getClientByIdAction } from '@/actions/formAction';
import { ContractSchema } from '@/schemas';

interface Contract {
  id: string;
  name: string;
  startDate: string;
  endDate: string | null;
}

interface Client {
  id: string;
  name: string;
  createUserId: string;
  contracts: Contract[];
}

type DialogType = "create" | "edit" | "delete" | "details" | null;

const ContractForm = ({ form, onSubmit, onCancel, submitButtonText }: {
  form: any,
  onSubmit: (data: any) => void,
  onCancel: () => void,
  submitButtonText: string
}) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormItem>
          <FormLabel>契約名</FormLabel>
          <FormControl>
            <Input {...form.register("name")} placeholder="契約名を入力" />
          </FormControl>
          <FormMessage />
        </FormItem>

        <FormItem>
          <FormLabel>開始日</FormLabel>
          <FormControl>
            <DateInput
              value={form.getValues("startDate")}
              onChange={(date) => form.setValue("startDate", date)}
            />
          </FormControl>
          <FormMessage />
        </FormItem>

        <FormItem>
          <FormLabel>終了日</FormLabel>
          <FormControl>
            <DateInput
              value={form.getValues("endDate")}
              onChange={(date) => form.setValue("endDate", date)}
              placeholder="終了日を選択（任意）"
            />
          </FormControl>
          <FormMessage />
        </FormItem>

        <FormItem>
          <FormLabel>単価</FormLabel>
          <FormControl>
            <Input {...form.register("unitPrice")}
              type="number" placeholder="e.g. 5000" />
          </FormControl>
          <FormMessage />
        </FormItem>

        <FormItem>
          <FormLabel>精算下限</FormLabel>
          <FormControl>
            <Input {...form.register("settlementMin")}
              type="number" placeholder="e.g. 100000" />
          </FormControl>
          <FormMessage />
        </FormItem>

        <FormItem>
          <FormLabel>精算上限</FormLabel>
          <FormControl>
            <Input {...form.register("settlementMax")}
              type="number" placeholder="e.g. 500000" />
          </FormControl>
          <FormMessage />
        </FormItem>

        <FormItem>
          <FormLabel>上限レート</FormLabel>
          <FormControl>
            <Input {...form.register("upperRate")}
              type="number" step="0.01" placeholder="e.g. 1.5" />
          </FormControl>
          <FormMessage />
        </FormItem>

        <FormItem>
          <FormLabel>中間レート</FormLabel>
          <FormControl>
            <Input {...form.register("middleRate")}
              type="number" step="0.01" placeholder="e.g. 1.0" />
          </FormControl>
          <FormMessage />
        </FormItem>

        <FormItem>
          <FormLabel>締め日</FormLabel>
          <FormControl>
            <Input {...form.register("closingDay")}
              type="number" placeholder="e.g. 1" />
          </FormControl>
          <FormMessage />
        </FormItem>

        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" variant="outline" onClick={onCancel}>キャンセル</Button>
          <Button type="submit">{submitButtonText}</Button>
        </div>
      </form>
    </Form>
  );
};

export default function ClientDetailsPage({
  params
}: {
  params: { clientId: string }
}) {
  const router = useRouter();
  const { clientId } = params;

  const [client, setClient] = useState<Client | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [activeContract, setActiveContract] = useState<Contract | null>(null);
  const [activeDialog, setActiveDialog] = useState<DialogType>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();

  const defaultFormValues: any = {
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

  const createForm = useForm({
    resolver: zodResolver(ContractSchema),
    defaultValues: defaultFormValues,
  });

  const editForm = useForm({
    resolver: zodResolver(ContractSchema),
    defaultValues: defaultFormValues,
  });

  useEffect(() => {
    startTransition(async () => {
      await fetchClientDetails();
    });
  }, [clientId]);

  const fetchClientDetails = async () => {
    try {
      const jsonData = await getClientByIdAction(clientId);
      if (jsonData) {
        const data = JSON.parse(JSON.stringify(jsonData));
        setClient({
          ...data,
          contracts: data.contracts.map((contract: Contract) => ({
              ...contract,
              startDate: contract.startDate.toString(),
              endDate: contract.endDate ? contract.endDate.toString() : null,
            })),
          });
          setContracts(data.contracts.map((contract: Contract) => ({
            ...contract,
            startDate: contract.startDate.toString(),
            endDate: contract.endDate ? contract.endDate.toString() : null,
          })));
      } else {
        throw new Error("クライアント情報が見つかりません");
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("クライアント情報の取得に失敗しました");
      }
      console.error(error);
      router.push("/client");
    }
  };

  const refreshContracts = async () => {
      try {
        const jsonData = await getClientByIdAction(clientId);
        if (jsonData) {
          // 念のための保険：クライアント側でも変換処理を行う
          const data = JSON.parse(JSON.stringify(jsonData));
          setContracts(data.contracts.map((contract: Contract) => ({
            ...contract,
            startDate: contract.startDate.toString(),
            endDate: contract.endDate ? contract.endDate.toString() : null
          })));
        }
      } catch (error) {
        console.error(error);
      }
  };

  const closeDialog = () => {
    setActiveDialog(null);
    setActiveContract(null);
  };

  const openDetailsDialog = (contract: Contract) => {
    setActiveContract(contract);
    setActiveDialog("details");
  };

  const onCreateContract = (data: any) => {
    startTransition(async () => {
      try {
        await createContractAction({ ...data, clientId });
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

  const onEditContract = (data: any) => {
    if (!activeContract) return;
    startTransition(async () => {
      try {
        await updateContractAction(activeContract.id, { ...data, clientId });
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

  useEffect(() => {
    if (activeDialog === "edit" && activeContract) {
      editForm.reset({
        name: activeContract.name,
        startDate: new Date(activeContract.startDate),
        endDate: activeContract.endDate ? new Date(activeContract.endDate) : undefined,
        unitPrice: "",
        settlementMin: "",
        settlementMax: "",
        upperRate: "",
        middleRate: "",
        closingDay: undefined,
      });
    }
  }, [activeDialog, activeContract, editForm]);

  if (isPending) {
    return (
      <div className="p-6 flex justify-center">
        <p>読み込み中...</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-6 flex justify-center">
        <p>クライアント情報が見つかりませんでした</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 relative">
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
        <DialogContent>
          <DialogTitle>契約詳細</DialogTitle>
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
        </DialogContent>
      </Dialog>

      <Dialog
        open={activeDialog === "create"}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      >
        <DialogContent>
          <DialogTitle>契約を作成</DialogTitle>
          <ContractForm
            form={createForm}
            onSubmit={onCreateContract}
            onCancel={closeDialog}
            submitButtonText="作成"
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={activeDialog === "edit"}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      >
        <DialogContent>
          <DialogTitle>契約を編集</DialogTitle>
          <ContractForm
            form={editForm}
            onSubmit={onEditContract}
            onCancel={closeDialog}
            submitButtonText="更新"
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={activeDialog === "delete"}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      >
        <DialogContent>
          <DialogTitle>契約の削除確認</DialogTitle>
          <div>
            <p>本当に契約 "{activeContract?.name}" を削除しますか？</p>
            <p className="text-sm text-gray-500 mt-2">この操作は元に戻すことができません。</p>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={closeDialog}>キャンセル</Button>
            <Button variant="destructive" onClick={onDeleteContract}>削除</Button>
          </div>
        </DialogContent>
      </Dialog>

      {isPending && <LoadingOverlay isClient={true} isPending={isPending}>{null}</LoadingOverlay>}
    </div>
  );
} 
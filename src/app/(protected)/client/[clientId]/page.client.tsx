"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FormError from "@/components/ui/feedback/error-alert";
import FormSuccess from "@/components/ui/feedback/success-alert";
import { useTransitionContext } from "@/contexts/transition-context";
import { Client } from "@/features/client/types/client";
import { createContractAction, deleteContractAction, updateContractAction, getContractsByClientIdAction } from '@/features/contract/actions/contract';
import { ContractDialog, type DialogType } from "@/features/contract/components/contract-dialog";
import { ContractForm, type ContractFormValues } from "@/features/contract/components/contract-form";
import { Contract } from "@/features/contract/types/contract";
import { convertContractFormValuesToContract, convertContractToFormValues } from "@/features/contract/utils/contract-converter";


export default function ClientClientDetailsPage({ client, userId }: { client: Client, userId: string }) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [activeContract, setActiveContract] = useState<Contract | null>(null);
  const [activeDialog, setActiveDialog] = useState<DialogType>(null);
  const [error, setError] = useState<{ message: string, date: Date }>({ message: "", date: new Date() });
  const [success, setSuccess] = useState<{ message: string, date: Date }>({ message: "", date: new Date() });
  const { startTransition } = useTransitionContext();
  const router = useRouter();

  const refreshContracts = useCallback(async () => {
    try {
      const contracts = await getContractsByClientIdAction(client.id);
      setContracts(contracts);
    } catch (error) {
      console.error(error);
    }
  }, [client.id]);

  useEffect(() => {
    startTransition(async () => {
      await refreshContracts();
    });
  }, [refreshContracts, startTransition]);

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
  const onCreateContract = (data: ContractFormValues) => {
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
  const onEditContract = (data: ContractFormValues) => {
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

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{client.name}</h1>
        <Button variant="outline" onClick={() => { handleNavigation("/client"); }}>
          戻る
        </Button>
      </div>

      <FormError message={error.message} resetSignal={error.date.getTime()} />
      <FormSuccess message={success.message} resetSignal={success.date.getTime()} />

      <Card>
        <CardHeader>
          <CardTitle>契約情報</CardTitle>
        </CardHeader>
        <CardContent>
          {contracts.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-muted-foreground">契約情報がありません</p>
            </div>
          ) : (
            <div className="space-y-4">
              {contracts.map((contract) => (
                <div
                  key={contract.id}
                  className="flex items-center justify-between gap-4 rounded-md border p-3"
                >
                  <div className="cursor-pointer hover:text-blue-500" onClick={() => { handleNavigation(`/contract/${contract.id}`); }}>
                    <div className="font-medium">{contract.name}</div>
                    <div className="text-sm text-muted-foreground">
                      期間: {new Date(contract.startDate).toLocaleDateString()} ~ {contract.endDate
                        ? new Date(contract.endDate).toLocaleDateString()
                        : ""}
                    </div>
                  </div>
                  <div className="ml-4 flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => { openDetailsDialog(contract); }}>詳細</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => { setActiveDialog("create"); }}>契約を作成</Button>
      </div>

      <ContractDialog
        type="details"
        isOpen={activeDialog === "details"}
        onClose={closeDialog}
      >
        {activeContract && (
          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-lg font-medium">基本情報</h3>
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
              <h3 className="mb-3 text-lg font-medium">精算情報</h3>
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
              <h3 className="mb-3 text-lg font-medium">勤務設定</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="font-semibold">1日あたりの作業単位</div>
                <div>{activeContract.dailyWorkMinutes ? `${activeContract.dailyWorkMinutes.toString()}分` : 'なし'}</div>
                <div className="font-semibold">1ヶ月あたりの作業単位</div>
                <div>{activeContract.monthlyWorkMinutes ? `${activeContract.monthlyWorkMinutes.toString()}分` : 'なし'}</div>
                <div className="font-semibold">基本開始時刻</div>
                <div>{activeContract.basicStartTime ? new Date(activeContract.basicStartTime).toLocaleTimeString('en-US', { timeZone: 'UTC', hour12: false, hour: '2-digit', minute: '2-digit' }) : 'なし'}</div>
                <div className="font-semibold">基本終了時刻</div>
                <div>{activeContract.basicEndTime ? new Date(activeContract.basicEndTime).toLocaleTimeString('en-US', { timeZone: 'UTC', hour12: false, hour: '2-digit', minute: '2-digit' }) : 'なし'}</div>
                <div className="font-semibold">基本休憩時間</div>
                <div>{activeContract.basicBreakDuration ? `${activeContract.basicBreakDuration.toString()}分` : 'なし'}</div>
                <div className="font-semibold">締め日</div>
                <div>{activeContract.closingDay ? `${activeContract.closingDay.toString()}日` : '末日'}</div>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setActiveDialog("edit"); }}>編集</Button>
              <Button variant="destructive" onClick={() => { setActiveDialog("delete"); }}>削除</Button>
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
          <p>本当に契約 &quot;{activeContract?.name}&quot; を削除しますか？</p>
          <p className="mt-2 text-sm text-gray-500">この操作は元に戻すことができません。</p>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={closeDialog}>キャンセル</Button>
          <Button variant="destructive" onClick={onDeleteContract}>削除</Button>
        </div>
      </ContractDialog>
    </div>
  );
} 
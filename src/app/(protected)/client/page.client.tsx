"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { StrictOmit } from "ts-essentials";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DialogFooter } from "@/components/ui/dialog";
import FormError from "@/components/ui/feedback/error-alert";
import FormSuccess from "@/components/ui/feedback/success-alert";
import { Label } from "@/components/ui/label";
import { useTransitionContext } from "@/contexts/transition-context";
import {
  getClientsByUserIdAction,
  createClientAction,
  updateClientAction,
  deleteClientAction,
} from "@/features/client/actions/client";
import { ClientDialog, type DialogType } from "@/features/client/components/client-dialog";
import { ClientForm, type ClientFormValues } from "@/features/client/components/client-form";
import { Client } from "@/features/client/types/client";
import { truncate } from "@/utils/string/string-utils";



export default function ClientClientListPage({ userId }: { userId: string }) {
  const [error, setError] = useState<{ message: string; date: Date }>({
    message: "",
    date: new Date(),
  });
  const [success, setSuccess] = useState<{ message: string; date: Date }>({
    message: "",
    date: new Date(),
  });
  const [clients, setClients] = useState<Client[]>([]);
  const { startTransition } = useTransitionContext();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [activeDialog, setActiveDialog] = useState<DialogType>(null);

  const router = useRouter();

  const fetchClients = useCallback(async () => {
    try {
      const data = await getClientsByUserIdAction(userId);
      setClients(data);
    } catch (error) {
      setError({
        message: "クライアント情報の取得に失敗しました",
        date: new Date(),
      });
      console.error(error);
    }
  }, [userId]);

  useEffect(() => {
    startTransition(async () => {
      await fetchClients();
    });
  }, [fetchClients, startTransition]);

  const closeDialog = () => {
    setActiveDialog(null);
    setSelectedClient(null);
  };

  const convertClientFormValuesToClient = (
    data: ClientFormValues,
    userId: string
  ): StrictOmit<Client, "id"> => {
    return {
      name: data.name,
      contactName: data.contactName || "",
      email: data.email || "",
      defaultEmailTemplateId: undefined,
      createUserId: userId,
    };
  };

  const onCreateClient = (values: ClientFormValues) => {
    startTransition(async () => {
      try {
        const clientData = convertClientFormValuesToClient(values, userId);
        await createClientAction(clientData);
        setSuccess({
          message: `クライアント '${values.name}' を作成しました`,
          date: new Date(),
        });
        closeDialog();
        await fetchClients();
      } catch (err) {
        console.error(err);
        setError({
          message: "クライアントの作成に失敗しました",
          date: new Date(),
        });
      }
    });
  };

  const onEditClient = (values: ClientFormValues) => {
    if (!selectedClient) return;
    startTransition(async () => {
      try {
        const clientData = convertClientFormValuesToClient(values, userId);
        await updateClientAction(selectedClient.id, clientData);
        setSuccess({
          message: `クライアント '${values.name}' を編集しました`,
          date: new Date(),
        });
        closeDialog();
        await fetchClients();
      } catch (err) {
        console.error(err);
        setError({
          message: "クライアントの更新に失敗しました",
          date: new Date(),
        });
      }
    });
  };

  const handleDeleteClient = () => {
    if (!selectedClient) return;
    startTransition(async () => {
      try {
        await deleteClientAction(selectedClient.id);
        setSuccess({ message: "クライアントを削除しました", date: new Date() });
        await fetchClients();
        closeDialog();
      } catch (error) {
        if (error instanceof Error) {
          setError({ message: error.message, date: new Date() });
        } else {
          setError({
            message: "クライアントの削除に失敗しました",
            date: new Date(),
          });
        }
        console.error(error);
      }
    });
  };

  const openDetailsModal = (client: Client) => {
    setSelectedClient(client);
    setActiveDialog("details");
  };

  const openDeleteConfirm = () => {
    setActiveDialog("delete");
  };

  const handleNavigation = (clientId: string) => {
    startTransition(() => {
      router.push(`/client/${clientId}`);
    });
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>クライアント一覧</CardTitle>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-muted-foreground">クライアントがありません</p>
            </div>
          ) : (
            <div className="p-4">
              <FormError
                message={error.message}
                resetSignal={error.date.getTime()}
              />
              <FormSuccess
                message={success.message}
                resetSignal={success.date.getTime()}
              />
              <div className="space-y-4">
                {clients.map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div
                      className="cursor-pointer font-medium hover:underline"
                      onClick={() => {
                        handleNavigation(client.id);
                      }}
                    >
                      <Label className="max-w-[300px] cursor-pointer truncate">
                        {truncate(client.name, 30)}
                      </Label>
                    </div>
                    <div className="ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          openDetailsModal(client);
                        }}
                      >
                        詳細
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={() => {
            setActiveDialog("create");
          }}
        >
          新規クライアント作成
        </Button>
      </div>

      {/* Details Modal */}
      <ClientDialog
        type="details"
        isOpen={activeDialog === "details"}
        onClose={closeDialog}
      >
        {selectedClient && (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="font-medium">クライアント名:</div>
              <div>{selectedClient.name}</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="font-medium">担当者名:</div>
              <div>{selectedClient.contactName}</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="font-medium">メールアドレス:</div>
              <div>{selectedClient.email}</div>
            </div>
          </div>
        )}
        <DialogFooter className="flex justify-between space-x-2">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setActiveDialog("edit");
              }}
            >
              編集
            </Button>
            <Button variant="destructive" onClick={openDeleteConfirm}>
              削除
            </Button>
          </div>
          <Button variant="outline" onClick={closeDialog}>
            閉じる
          </Button>
        </DialogFooter>
      </ClientDialog>

      {/* Create Modal */}
      <ClientDialog
        type="create"
        isOpen={activeDialog === "create"}
        onClose={closeDialog}
      >
        <ClientForm
          onSubmit={onCreateClient}
          submitButtonText="作成"
          onCancel={closeDialog}
        />
      </ClientDialog>

      {/* Edit Modal */}
      <ClientDialog
        type="edit"
        isOpen={activeDialog === "edit"}
        onClose={closeDialog}
      >
        <ClientForm
          defaultValues={
            selectedClient
              ? {
                name: selectedClient.name,
                contactName: selectedClient.contactName,
                email: selectedClient.email,
              }
              : undefined
          }
          onSubmit={onEditClient}
          submitButtonText="保存"
          onCancel={closeDialog}
        />
      </ClientDialog>

      {/* Delete Confirmation Modal */}
      <ClientDialog
        type="delete"
        isOpen={activeDialog === "delete"}
        onClose={closeDialog}
      >
        <div className="py-4">
          <p className="text-center">
            {selectedClient?.name} を削除してもよろしいですか？
          </p>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            この操作は元に戻せません。
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={closeDialog}>
            キャンセル
          </Button>
          <Button variant="destructive" onClick={handleDeleteClient}>
            削除
          </Button>
        </DialogFooter>
      </ClientDialog>
    </div>
  );
}

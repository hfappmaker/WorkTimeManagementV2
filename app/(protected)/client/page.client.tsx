"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { getClientsByUserIdAction, createClientAction, updateClientAction, deleteClientAction } from "@/actions/client";
import { useRouter } from "next/navigation";
import { truncate } from "@/lib/utils";
import { useTransitionContext } from "@/contexts/TransitionContext";
import FormError from "@/components/form-error";
import FormSuccess from "@/components/form-success";
import { Client as PrismaClient } from "@prisma/client";

type ClientFormValues = z.infer<typeof clientFormSchema>;
type Client = Omit<PrismaClient, 'createdAt' | 'updatedAt'>;

type DialogType = "details" | "create" | "edit" | "delete" | null;

interface ClientDialogProps {
  type: DialogType;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const ClientDialog = ({ type, isOpen, onClose, children }: ClientDialogProps) => (
  <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
    <DialogPortal>
      <DialogOverlay />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {type === "details" && "クライアント詳細"}
            {type === "create" && "新規クライアント作成"}
            {type === "edit" && "クライアント編集"}
            {type === "delete" && "クライアント削除の確認"}
          </DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </DialogPortal>
  </Dialog>
);

const clientFormSchema = z.object({
  name: z.string().min(1, "クライアント名は必須です"),
  contactName: z.string(),
  email: z.string().email("有効なメールアドレスを入力してください"),
});

interface ClientFormProps {
  defaultValues?: ClientFormValues;
  onSubmit: (values: ClientFormValues) => Promise<void>;
  submitButtonText: string;
  onCancel: () => void;
}

const ClientForm = ({ defaultValues, onSubmit, submitButtonText, onCancel }: ClientFormProps) => {
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: defaultValues || {
      name: "",
      contactName: "",
      email: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>クライアント名</FormLabel>
              <FormControl>
                <Input placeholder="クライアント名を入力" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contactName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>担当者名</FormLabel>
              <FormControl>
                <Input placeholder="担当者名を入力" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>メールアドレス</FormLabel>
              <FormControl>
                <Input placeholder="メールアドレスを入力" {...field} type="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            キャンセル
          </Button>
          <Button type="submit">
            {submitButtonText}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default function ClientClientListPage({ userId }: { userId: string }) {
  const [error, setError] = useState<{ message: string, date: Date }>({ message: "", date: new Date() });
  const [success, setSuccess] = useState<{ message: string, date: Date }>({ message: "", date: new Date() });
  const [clients, setClients] = useState<Client[]>([]);
  const { startTransition } = useTransitionContext();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [activeDialog, setActiveDialog] = useState<DialogType>(null);

  const router = useRouter();

  useEffect(() => {
    startTransition(async () => {
      await fetchClients();
    });
  }, []);

  // ダイアログを閉じる
  const closeDialog = () => {
    setActiveDialog(null);
    setSelectedClient(null);
  };

  const fetchClients = async () => {
    try {
      const data = await getClientsByUserIdAction(userId);
      setClients(data);
    } catch (error) {
      setError({ message: "クライアント情報の取得に失敗しました", date: new Date() });
      console.error(error);
    }
  };

  // クライアントデータを変換する関数
  const convertClientData = (data: ClientFormValues, userId: string) => {
    return {
      name: data.name,
      contactName: data.contactName || "",
      email: data.email || "",
      defaultEmailTemplateId: null,
      createUserId: userId,
    };
  };

  // クライアント作成
  const onCreateClient = async (values: ClientFormValues) => {
    startTransition(async () => {
      try {
        const clientData = convertClientData(values, userId);
        await createClientAction(clientData);
        setSuccess({ message: `クライアント '${values.name}' を作成しました`, date: new Date() });
        closeDialog();
        await fetchClients();
      } catch (err) {
        console.error(err);
        setError({ message: "クライアントの作成に失敗しました", date: new Date() });
      }
    });
  };

  // クライアント編集
  const onEditClient = async (values: ClientFormValues) => {
    if (!selectedClient) return;
    startTransition(async () => {
      try {
        const clientData = convertClientData(values, userId);
        await updateClientAction(selectedClient.id, clientData);
        setSuccess({ message: `クライアント '${values.name}' を編集しました`, date: new Date() });
        closeDialog();
        await fetchClients();
      } catch (err) {
        console.error(err);
        setError({ message: "クライアントの更新に失敗しました", date: new Date() });
      }
    });
  };

  const handleDeleteClient = async () => {
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
          setError({ message: "クライアントの削除に失敗しました", date: new Date() });
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
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>クライアント一覧</CardTitle>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <div className="text-center p-4">
              <p className="text-muted-foreground">クライアントがありません</p>
            </div>
          ) : (
            <div className="p-4">
              {error && <FormError message={error.message} resetSignal={error.date.getTime()} />}
              {success && <FormSuccess message={success.message} resetSignal={success.date.getTime()} />}
              <div className="space-y-4">
                {clients.map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between p-3 border rounded-md"
                  >
                    <div 
                      className="font-medium hover:underline cursor-pointer" 
                      onClick={() => handleNavigation(client.id)}
                    >
                      <Label className="truncate max-w-[300px] cursor-pointer">
                        {truncate(client.name, 30)}
                      </Label>
                    </div>
                    <div className="ml-4">
                      <Button variant="outline" size="sm" onClick={() => openDetailsModal(client)}>
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
        <Button onClick={() => setActiveDialog("create")}>
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
        <DialogFooter className="flex space-x-2 justify-between">
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setActiveDialog("edit")}>
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
          defaultValues={selectedClient ? {
            name: selectedClient.name,
            contactName: selectedClient.contactName,
            email: selectedClient.email,
          } : undefined}
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
          <p className="text-center text-sm text-muted-foreground mt-2">
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

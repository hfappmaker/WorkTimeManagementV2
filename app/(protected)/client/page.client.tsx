"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

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
import { getClientsByUserIdAction, createClientAction, updateClientAction, deleteClientAction } from "@/actions/formAction";
import { useRouter } from "next/navigation";
import { truncate } from "@/lib/utils";
import { useTransitionContext } from "@/contexts/TransitionContext";

// クライアント作成/編集では ClientSchema (name, contactName, email, createUserId) を利用するので、
// 担当者名 (contactName) とメールアドレス (email) も含むようにインターフェースを修正します。
interface Client {
  id: string;
  name: string;
  contactName: string;
  email: string;
  createUserId: string;
}

type DialogType = "create" | "edit" | "delete" | "details" | null;

export default function ClientClientListPage({ userId }: { userId: string }) {
  const [clients, setClients] = useState<Client[]>([]);
  const { startTransition } = useTransitionContext();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [activeDialog, setActiveDialog] = useState<DialogType>(null);

  // 作成用の状態：クライアント名、担当者名、メールアドレス
  const [newClientName, setNewClientName] = useState("");
  const [newContactName, setNewContactName] = useState("");
  const [newEmail, setNewEmail] = useState("");

  // 編集用の状態
  const [editClientName, setEditClientName] = useState("");
  const [editContactName, setEditContactName] = useState("");
  const [editEmail, setEditEmail] = useState("");

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
      toast.error("クライアント情報の取得に失敗しました");
      console.error(error);
    }
  };

  // 作成時は必須項目 (クライアント名、担当者名、メールアドレス) の入力チェックを行い、ClientSchema通りのデータを渡します
  const handleCreateClient = async () => {
    if (!newClientName.trim()) {
      toast.error("クライアント名を入力してください");
      return;
    }
    startTransition(async () => {
      try {
        await createClientAction({
          createUserId: userId,
          name: newClientName,
          contactName: newContactName,
          email: newEmail,
        });

        toast.success("クライアントを作成しました");
        await fetchClients();
        closeDialog();
        // 入力欄をクリア
        setNewClientName("");
        setNewContactName("");
        setNewEmail("");
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("クライアントの作成に失敗しました");
        }
        console.error(error);
      }
    });
  };

  // 編集時も同様に、必須項目が入力されていることをチェックして更新します
  const handleEditClient = async () => {
    if (!selectedClient || !editClientName.trim()) {
      toast.error("クライアント名を入力してください");
      return;
    }
    startTransition(async () => {
      try {
        await updateClientAction(selectedClient.id, {
          createUserId: userId,
          name: editClientName,
          contactName: editContactName,
          email: editEmail,
        });
        toast.success("クライアント情報を更新しました");
        await fetchClients();
        closeDialog();
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("クライアント情報の更新に失敗しました");
        }
        console.error(error);
      }
    });
  };

  const handleDeleteClient = async () => {
    if (!selectedClient) return;
    startTransition(async () => {
      try {
        await deleteClientAction(selectedClient.id);
        toast.success("クライアントを削除しました");
        await fetchClients();
        closeDialog();
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("クライアントの削除に失敗しました");
        }
        console.error(error);
      }
    });
  };

  const openDetailsModal = (client: Client) => {
    setSelectedClient(client);
    setActiveDialog("details");
  };

  // 編集時は、選択中のクライアント情報 (クライアント名、担当者名、メールアドレス) を初期値として設定します
  const openEditModal = () => {
    if (selectedClient) {
      setEditClientName(selectedClient.name);
      setEditContactName(selectedClient.contactName);
      setEditEmail(selectedClient.email);
      setActiveDialog("edit");
    }
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
            <div className="space-y-4">
              {clients.map((client) => (
                <div
                  key={client.id}
                  className="flex items-center justify-between p-3 border rounded-md"
                >
                  <div className="font-medium hover:underline" onClick={() => handleNavigation(client.id)}>
                    <Label className="truncate max-w-[300px]">
                      {truncate(client.name, 30)}
                    </Label>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => openDetailsModal(client)}>
                    詳細
                  </Button>
                </div>
              ))}
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
      <Dialog open={activeDialog === "details"}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}>
        <DialogPortal>
          <DialogOverlay />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>クライアント詳細</DialogTitle>
            </DialogHeader>
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
                <Button variant="outline" onClick={openEditModal}>
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
          </DialogContent>
        </DialogPortal>
      </Dialog>

      {/* Create Modal */}
      <Dialog open={activeDialog === "create"}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}>
        <DialogPortal>
          <DialogOverlay />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新規クライアント作成</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  クライアント名
                </Label>
                <Input
                  id="name"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="クライアント名を入力"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-name" className="text-sm font-medium">
                  担当者名
                </Label>
                <Input
                  id="contact-name"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  placeholder="担当者名を入力"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  メールアドレス
                </Label>
                <Input
                  id="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="メールアドレスを入力"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeDialog}>
                キャンセル
              </Button>
              <Button onClick={handleCreateClient}>
                作成
              </Button>
            </DialogFooter>
          </DialogContent>
        </DialogPortal>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={activeDialog === "edit"}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}>
        <DialogPortal>
          <DialogOverlay />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>クライアント編集</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-sm font-medium">
                  クライアント名
                </Label>
                <Input
                  id="edit-name"
                  value={editClientName}
                  onChange={(e) => setEditClientName(e.target.value)}
                  placeholder="クライアント名を入力"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-contact-name" className="text-sm font-medium">
                  担当者名
                </Label>
                <Input
                  id="edit-contact-name"
                  value={editContactName}
                  onChange={(e) => setEditContactName(e.target.value)}
                  placeholder="担当者名を入力"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email" className="text-sm font-medium">
                  メールアドレス
                </Label>
                <Input
                  id="edit-email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="メールアドレスを入力"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeDialog}>
                キャンセル
              </Button>
              <Button onClick={handleEditClient}>
                保存
              </Button>
            </DialogFooter>
          </DialogContent>
        </DialogPortal>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={activeDialog === "delete"}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}>
        <DialogPortal>
          <DialogOverlay />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>クライアント削除の確認</DialogTitle>
            </DialogHeader>
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
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </div>
  );
}

"use client";

import { useState, useEffect, useTransition } from "react";
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
import LoadingOverlay from "@/components/LoadingOverlay";
import { useIsClient } from "@/hooks/use-is-client";
import { useRouter } from "next/navigation";
import { truncate } from "@/lib/utils";
interface Client {
  id: string;
  name: string;
  createUserId: string;
}

export default function ClientClientListPage({ userId }: { userId: string }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [isPending, startTransition] = useTransition();
  const isClient = useIsClient();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [newClientName, setNewClientName] = useState("");
  const [editClientName, setEditClientName] = useState("");
  const router = useRouter();

  useEffect(() => {
    startTransition(async () => {
      await fetchClients();
    });
  }, []);

  const fetchClients = async () => {
    try {
      const data = await getClientsByUserIdAction(userId);
      setClients(data);
    } catch (error) {
      toast.error("クライアント情報の取得に失敗しました");
      console.error(error);
    }
  };

  const handleCreateClient = async () => {
    if (!newClientName.trim()) {
      toast.error("クライアント名を入力してください");
      return;
    }
    startTransition(async () => {
      try {
        await createClientAction({ createUserId: userId, name: newClientName });

        toast.success("クライアントを作成しました");
        await fetchClients();
        setShowCreateModal(false);
        setNewClientName("");
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

  const handleEditClient = async () => {
    if (!selectedClient || !editClientName.trim()) {
      toast.error("クライアント名を入力してください");
      return;
    }
    startTransition(async () => {
      try {
        await updateClientAction(selectedClient.id, { createUserId: userId, name: editClientName });
        toast.success("クライアント情報を更新しました");
        await fetchClients();
        setShowEditModal(false);
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
        setShowDeleteConfirm(false);
        setShowDetailsModal(false);
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
    setShowDetailsModal(true);
  };

  const openEditModal = () => {
    if (selectedClient) {
      setEditClientName(selectedClient.name);
      setShowEditModal(true);
      setShowDetailsModal(false);
    }
  };

  const openDeleteConfirm = () => {
    setShowDeleteConfirm(true);
    setShowDetailsModal(false);
  };

  // Link クリック時の遷移処理
  const handleNavigation = (clientId: string) => {
    startTransition(() => {
      router.push(`/client/${clientId}`);
    });
  };

  return (
    <LoadingOverlay isClient={isClient} isPending={isPending}>
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDetailsModal(client)}
                    >
                      詳細
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={() => setShowCreateModal(true)}>
            新規クライアント作成
          </Button>
        </div>

        {/* Details Modal */}
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
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
                <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                  閉じる
                </Button>
              </DialogFooter>
            </DialogContent>
          </DialogPortal>
        </Dialog>

        {/* Create Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogPortal>
            <DialogOverlay />
            <DialogContent>
              <LoadingOverlay isClient={isClient} isPending={isPending}>
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
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                    キャンセル
                  </Button>
                  <Button onClick={handleCreateClient}>
                    作成
                  </Button>
                </DialogFooter>
              </LoadingOverlay>
            </DialogContent>
          </DialogPortal>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogPortal>
            <DialogOverlay />
            <DialogContent>
              <LoadingOverlay isClient={isClient} isPending={isPending}>
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
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowEditModal(false)}>
                    キャンセル
                  </Button>
                  <Button onClick={handleEditClient}>
                    保存
                  </Button>
                </DialogFooter>
              </LoadingOverlay>
            </DialogContent>
          </DialogPortal>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogPortal>
            <DialogOverlay />
            <DialogContent>
              <LoadingOverlay isClient={isClient} isPending={isPending}>
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
                  <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                    キャンセル
                  </Button>
                  <Button variant="destructive" onClick={handleDeleteClient}>
                    削除
                  </Button>
                </DialogFooter>
              </LoadingOverlay>
            </DialogContent>
          </DialogPortal>
        </Dialog>
      </div>
    </LoadingOverlay>
  );
}

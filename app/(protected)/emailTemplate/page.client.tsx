"use client";

import { useState, useEffect, useTransition } from "react";
import { createEmailTemplateAction, updateEmailTemplateAction, deleteEmailTemplateAction, getEmailTemplatesByCreateUserIdAction } from "@/actions/formAction";
import { Dialog, DialogContent, DialogHeader, DialogOverlay, DialogPortal, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { TextArea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import LoadingOverlay from "@/components/LoadingOverlay";
import FormError from "@/components/form-error";
import FormSuccess from "@/components/form-success";
import { useIsClient } from "@/hooks/use-is-client";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { EmailTemplateSchema } from "@/schemas";

// Define dialog types
type DialogType = "create" | "edit" | "delete" | "details" | null;

interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    body: string;
    createUserId: string;
}

export default function EmailTemplateClientPage({ userId }: { userId: string }) {
    // Local state for templates, dialogs, active template etc.
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [activeDialog, setActiveDialog] = useState<DialogType>(null);
    const [activeEmailTemplate, setActiveEmailTemplate] = useState<EmailTemplate | null>(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isPending, startTransition] = useTransition();
    const isClient = useIsClient();

    const defaultFormValues = {
        name: "",
        subject: "",
        body: "",
        createUserId: userId,
    };

    const createForm = useForm<z.infer<typeof EmailTemplateSchema>>({
        resolver: zodResolver(EmailTemplateSchema),
        defaultValues: defaultFormValues,
    });

    const editForm = useForm<z.infer<typeof EmailTemplateSchema>>({
        resolver: zodResolver(EmailTemplateSchema),
        defaultValues: defaultFormValues,
    });

    // Refresh email templates from the server
    const refreshTemplates = async () => {
        try {
            const jsonData = await getEmailTemplatesByCreateUserIdAction(userId);
            if (jsonData) {
                const data = JSON.parse(JSON.stringify(jsonData));
                setTemplates(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        startTransition(async () => {
            await refreshTemplates();
        });
    }, []);

    const closeDialog = () => {
        setActiveDialog(null);
        setActiveEmailTemplate(null);
    };

    // Create email template
    const onCreateEmailTemplate = (data: z.infer<typeof EmailTemplateSchema>) => {
        startTransition(async () => {
            try {
                await createEmailTemplateAction(data);
                setSuccess(`メールテンプレート '${data.name}' を作成しました`);
                createForm.reset(defaultFormValues);
                closeDialog();
                await refreshTemplates();
            } catch (err) {
                console.error(err);
                setError("メールテンプレートの作成に失敗しました");
            }
        });
    };

    // Edit email template
    const onEditEmailTemplate = (data: z.infer<typeof EmailTemplateSchema>) => {
        if (!activeEmailTemplate) return;
        startTransition(async () => {
            try {
                await updateEmailTemplateAction(activeEmailTemplate.id, data);
                setSuccess("メールテンプレートを編集しました");
                closeDialog();
                editForm.reset(defaultFormValues);
                await refreshTemplates();
            } catch (err) {
                console.error(err);
                setError("メールテンプレートの更新に失敗しました");
            }
        });
    };

    // Delete email template
    const onDeleteEmailTemplate = () => {
        if (!activeEmailTemplate) return;
        startTransition(async () => {
            try {
                await deleteEmailTemplateAction(activeEmailTemplate.id);
                setSuccess("メールテンプレートを削除しました");
                closeDialog();
                await refreshTemplates();
            } catch (err) {
                console.error(err);
                setError("メールテンプレートの削除に失敗しました");
            }
        });
    };

    // Initialize edit form when edit dialog opens
    useEffect(() => {
        if (activeDialog === "edit" && activeEmailTemplate) {
            editForm.reset({
                name: activeEmailTemplate.name,
                subject: activeEmailTemplate.subject,
                body: activeEmailTemplate.body,
                createUserId: activeEmailTemplate.createUserId,
            });
        }
    }, [activeDialog, activeEmailTemplate, editForm]);

    return (
        <div className="p-4">
            <LoadingOverlay isClient={isClient} isPending={isPending}>
                <h1 className="text-2xl font-bold mb-4">メールテンプレート一覧</h1>
                {error && <div className="mb-4"><FormError message={error} resetSignal={Date.now()} /></div>}
                {success && <div className="mb-4"><FormSuccess message={success} resetSignal={Date.now()} /></div>}
                <div className="mb-4">
                    <Button onClick={() => setActiveDialog("create")}>新規作成</Button>
                </div>
                {templates && templates.length > 0 ? (
                    <ul>
                        {templates.map((template) => (
                            <li key={template.id} className="border p-3 mb-2 flex justify-between items-center">
                                <div className="cursor-pointer">
                                    <div className="font-medium">{template.name}</div>
                                    <div className="text-sm text-muted-foreground">Subject: {template.subject}</div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => { setActiveEmailTemplate(template); setActiveDialog("details"); }}>詳細</Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>メールテンプレートがありません。</p>
                )}

                {/* Details Dialog */}
                <Dialog
                    open={activeDialog === "details"}
                    onOpenChange={(open) => {
                        if (!open) closeDialog();
                    }}
                >
                    <DialogPortal>
                        <DialogOverlay />
                        <DialogContent className="w-96 p-6">
                            <DialogHeader>
                                <DialogTitle>メールテンプレート詳細</DialogTitle>
                            </DialogHeader>
                            {activeEmailTemplate && (
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-lg font-medium">基本情報</h3>
                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                            <div className="font-semibold">Name</div>
                                            <div>{activeEmailTemplate.name}</div>
                                            <div className="font-semibold">Subject</div>
                                            <div>{activeEmailTemplate.subject}</div>
                                            <div className="font-semibold">Body</div>
                                            <div>{activeEmailTemplate.body}</div>
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

                {/* Create Dialog */}
                <Dialog
                    open={activeDialog === "create"}
                    onOpenChange={(open) => {
                        if (!open) closeDialog();
                    }}
                >
                    <DialogPortal>
                        <DialogOverlay />
                        <DialogContent className="w-96 p-6">
                            <DialogHeader>
                                <DialogTitle>新規メールテンプレート作成</DialogTitle>
                            </DialogHeader>
                            <Form {...createForm}>
                                <form onSubmit={createForm.handleSubmit(onCreateEmailTemplate)} className="space-y-4">
                                    <FormField
                                        control={createForm.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Name</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Name" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={createForm.control}
                                        name="subject"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Subject</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Subject" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={createForm.control}
                                        name="body"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Body</FormLabel>
                                                <FormControl>
                                                    <TextArea {...field} placeholder="Body" rows={4} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="flex justify-end gap-2 mt-4">
                                        <Button type="button" variant="outline" onClick={closeDialog}>キャンセル</Button>
                                        <Button type="submit">作成</Button>
                                    </div>
                                </form>
                            </Form>
                        </DialogContent>
                    </DialogPortal>
                </Dialog>

                {/* Edit Dialog */}
                <Dialog
                    open={activeDialog === "edit"}
                    onOpenChange={(open) => {
                        if (!open) closeDialog();
                    }}
                >
                    <DialogPortal>
                        <DialogOverlay />
                        <DialogContent className="w-96 p-6">
                            <DialogHeader>
                                <DialogTitle>メールテンプレートを編集</DialogTitle>
                            </DialogHeader>
                            <Form {...editForm}>
                                <form onSubmit={editForm.handleSubmit(onEditEmailTemplate)} className="space-y-4">
                                    <FormField
                                        control={editForm.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Name</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Name" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={editForm.control}
                                        name="subject"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Subject</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Subject" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={editForm.control}
                                        name="body"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Body</FormLabel>
                                                <FormControl>
                                                    <TextArea {...field} placeholder="Body" rows={4} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="flex justify-end gap-2 mt-4">
                                        <Button type="button" variant="outline" onClick={closeDialog}>キャンセル</Button>
                                        <Button type="submit">更新</Button>
                                    </div>
                                </form>
                            </Form>
                        </DialogContent>
                    </DialogPortal>
                </Dialog>

                {/* Delete Dialog */}
                <Dialog
                    open={activeDialog === "delete"}
                    onOpenChange={(open) => {
                        if (!open) closeDialog();
                    }}
                >
                    <DialogPortal>
                        <DialogOverlay />
                        <DialogContent className="w-96 p-6">
                            <DialogHeader>
                                <DialogTitle>メールテンプレートの削除確認</DialogTitle>
                            </DialogHeader>
                            <div>
                                <p>本当にメールテンプレート "{activeEmailTemplate?.name}" を削除しますか？</p>
                                <p className="text-sm text-gray-500 mt-2">この操作は元に戻すことができません。</p>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <Button variant="outline" onClick={closeDialog}>キャンセル</Button>
                                <Button variant="destructive" onClick={onDeleteEmailTemplate}>削除</Button>
                            </div>
                        </DialogContent>
                    </DialogPortal>
                </Dialog>
            </LoadingOverlay>
        </div>
    );
}

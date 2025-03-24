"use client";

import { useState, useEffect } from "react";
import { createEmailTemplateAction, updateEmailTemplateAction, deleteEmailTemplateAction, getEmailTemplatesByCreateUserIdAction } from "@/actions/email-template";
import { Dialog, DialogContent, DialogHeader, DialogOverlay, DialogPortal, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { TextArea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import FormError from "@/components/form-error";
import FormSuccess from "@/components/form-success";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTransitionContext } from "@/contexts/TransitionContext";
import { EmailTemplate } from "@/types/email-template";

type DialogType = "create" | "edit" | "delete" | "details" | null;

const emailTemplateFormSchema = z.object({
    name: z.string().min(1, "メールテンプレート名は必須です"),
    subject: z.string().min(1, "件名は必須です"),
    body: z.string().min(1, "本文は必須です"),
  });
  
  type EmailTemplateFormValues = z.infer<typeof emailTemplateFormSchema>;

interface EmailTemplateFormDialogProps {
  defaultValues?: EmailTemplateFormValues;
  onSubmit: (values: EmailTemplateFormValues) => void;
  submitButtonText: string;
  onCancel: () => void;
}

const EmailTemplateFormDialog = ({ defaultValues, onSubmit, submitButtonText, onCancel }: EmailTemplateFormDialogProps) => {
  const form = useForm<EmailTemplateFormValues>({
    resolver: zodResolver(emailTemplateFormSchema),
    defaultValues: defaultValues || {
      name: "",
      subject: "",
      body: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
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
          control={form.control}
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
          control={form.control}
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
          <Button type="button" variant="outline" onClick={onCancel}>キャンセル</Button>
          <Button type="submit">{submitButtonText}</Button>
        </div>
      </form>
    </Form>
  );
};

interface EmailTemplateDialogProps {
  type: DialogType;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  template?: EmailTemplate | null;
  onSubmit?: (values: EmailTemplateFormValues) => void;
  onDelete?: () => void;
  onCancel: () => void;
}

const EmailTemplateDialog = ({ type, isOpen, onOpenChange, template, onSubmit, onDelete, onCancel }: EmailTemplateDialogProps) => {
  const getDialogTitle = () => {
    switch (type) {
      case "create":
        return "新規メールテンプレート作成";
      case "edit":
        return "メールテンプレートを編集";
      case "delete":
        return "メールテンプレートの削除確認";
      case "details":
        return "メールテンプレート詳細";
      default:
        return "";
    }
  };

  const renderContent = () => {
    switch (type) {
      case "create":
        return (
          <EmailTemplateFormDialog
            onSubmit={onSubmit!}
            submitButtonText="作成"
            onCancel={onCancel}
          />
        );
      case "edit":
        return (
          <EmailTemplateFormDialog
            defaultValues={template ? {
              name: template.name,
              subject: template.subject,
              body: template.body,
            } : undefined}
            onSubmit={onSubmit!}
            submitButtonText="更新"
            onCancel={onCancel}
          />
        );
      case "delete":
        return (
          <>
            <div>
              <p>本当にメールテンプレート "{template?.name}" を削除しますか？</p>
              <p className="text-sm text-gray-500 mt-2">この操作は元に戻すことができません。</p>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={onCancel}>キャンセル</Button>
              <Button variant="destructive" onClick={onDelete}>削除</Button>
            </div>
          </>
        );
      case "details":
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">基本情報</h3>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="font-semibold">Name</div>
                <div>{template?.name}</div>
                <div className="font-semibold">Subject</div>
                <div>{template?.subject}</div>
                <div className="font-semibold">Body</div>
                <div>{template?.body}</div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>閉じる</Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <DialogPortal>
        <DialogOverlay />
        <DialogContent className="w-96 p-6">
          <DialogHeader>
            <DialogTitle>{getDialogTitle()}</DialogTitle>
          </DialogHeader>
          {renderContent()}
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

export default function EmailTemplateClientPage({ userId }: { userId: string }) {
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [activeDialog, setActiveDialog] = useState<DialogType>(null);
    const [activeEmailTemplate, setActiveEmailTemplate] = useState<EmailTemplate | null>(null);
    const [error, setError] = useState<{ message: string, date: Date }>({ message: "", date: new Date() });
    const [success, setSuccess] = useState<{ message: string, date: Date }>({ message: "", date: new Date() });
    const { startTransition } = useTransitionContext();

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

    // メールテンプレートデータを変換する関数
    const convertEmailTemplateData = (data: EmailTemplateFormValues, userId: string) => {
        return {
            name: data.name,
            subject: data.subject,
            body: data.body,
            createUserId: userId,
        };
    };

    // メールテンプレート作成
    const onCreateEmailTemplate = (data: EmailTemplateFormValues) => {
        startTransition(async () => {
            try {
                const templateData = convertEmailTemplateData(data, userId);
                await createEmailTemplateAction(templateData);
                setSuccess({ message: `メールテンプレート '${data.name}' を作成しました`, date: new Date() });
                closeDialog();
                await refreshTemplates();
            } catch (err) {
                console.error(err);
                setError({ message: "メールテンプレートの作成に失敗しました", date: new Date() });
            }
        });
    };

    // メールテンプレート編集
    const onEditEmailTemplate = (data: EmailTemplateFormValues) => {
        if (!activeEmailTemplate) return;
        startTransition(async () => {
            try {
                const templateData = convertEmailTemplateData(data, userId);
                await updateEmailTemplateAction(activeEmailTemplate.id, templateData);
                setSuccess({ message: `メールテンプレート '${data.name}' を編集しました`, date: new Date() });
                closeDialog();
                await refreshTemplates();
            } catch (err) {
                console.error(err);
                setError({ message: "メールテンプレートの更新に失敗しました", date: new Date() });
            }
        });
    };

    // メールテンプレート削除
    const onDeleteEmailTemplate = () => {
        if (!activeEmailTemplate) return;
        startTransition(async () => {
            try {
                await deleteEmailTemplateAction(activeEmailTemplate.id);
                setSuccess({ message: `メールテンプレート '${activeEmailTemplate.name}' を削除しました`, date: new Date() });
                closeDialog();
                await refreshTemplates();
            } catch (err) {
                console.error(err);
                setError({ message: "メールテンプレートの削除に失敗しました", date: new Date() });
            }
        });
    };

    return (
        <div className="p-4">
                <h1 className="text-2xl font-bold mb-4">メールテンプレート一覧</h1>
                {error && <div className="mb-4"><FormError message={error.message} resetSignal={error.date.getTime()} /></div>}
                {success && <div className="mb-4"><FormSuccess message={success.message} resetSignal={success.date.getTime()} /></div>}
                <div className="mb-4">
                    <Button onClick={() => setActiveDialog("create")}>新規作成</Button>
                </div>
                {templates && templates.length > 0 ? (
                    <ul>
                        {templates.map((template) => (
                            <li key={template.id} className="border p-3 mb-2 flex justify-between items-center">
                                <div className="cursor-pointer" onClick={() => { setActiveEmailTemplate(template); setActiveDialog("details"); }}>
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

                <EmailTemplateDialog
                    type={activeDialog!}
                    isOpen={activeDialog !== null}
                    onOpenChange={(open) => {
                        if (!open) closeDialog();
                    }}
                    template={activeEmailTemplate}
                    onSubmit={activeDialog === "create" ? onCreateEmailTemplate : onEditEmailTemplate}
                    onDelete={onDeleteEmailTemplate}
                    onCancel={closeDialog}
                />
        </div>
    );
}

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export const clientFormSchema = z.object({
    name: z.string().min(1, "クライアント名は必須です"),
    contactName: z.string(),
    email: z.string().email("有効なメールアドレスを入力してください"),
});

export type ClientFormValues = z.infer<typeof clientFormSchema>;

type ClientFormProps = {
    defaultValues?: ClientFormValues;
    onSubmit: (values: ClientFormValues) => void;
    submitButtonText: string;
    onCancel: () => void;
};

export const ClientForm = ({
    defaultValues,
    onSubmit,
    submitButtonText,
    onCancel,
}: ClientFormProps) => {
    const form = useForm<ClientFormValues>({
        resolver: zodResolver(clientFormSchema),
        defaultValues: defaultValues ?? {
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
                    <Button type="submit">{submitButtonText}</Button>
                </DialogFooter>
            </form>
        </Form>
    );
}; 
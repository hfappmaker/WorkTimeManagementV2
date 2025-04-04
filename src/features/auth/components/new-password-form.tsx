"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { MessageDisplay } from "@/components/ui/feedback/message-display";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useMessageState } from "@/hooks/use-message-state";
import { newPassword } from "@/features/auth/actions/new-password";
import CardWrapper from "@/features/auth/components/card-wrapper";
import { PasswordInput } from "@/features/auth/components/password-input";
import { NewPasswordSchema } from "@/features/auth/schemas/new-password";

const NewPasswordForm = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const { error, success, showError, showSuccess } = useMessageState();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof NewPasswordSchema>>({
    resolver: zodResolver(NewPasswordSchema),
    defaultValues: {
      password: "",
      passwordConfirmation: "",
    },
  });

  const onSubmit = (values: z.infer<typeof NewPasswordSchema>) => {
    startTransition(async () => {
      try {
        const data = await newPassword(values, token);
        if (data.error) showError(data.error);
        if (data.success) showSuccess(data.success);
      } catch (err) {
        console.error(err);
        showError("Something went wrong!");
      }
    });

    form.reset();
  };

  return (
    <CardWrapper
      headerLabel="Enter a new password"
      backButtonLabel="Back to login"
      backButtonHref="/auth/login"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      {...field}
                      disabled={isPending}
                      placeholder="******"
                      type="password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="passwordConfirmation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm your password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      {...field}
                      disabled={isPending}
                      type="password"
                      placeholder="******"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <MessageDisplay error={error} success={success} />
          <Button
            disabled={isPending}
            type="submit"
            className="w-full hover:bg-sky-400"
          >
            Reset password
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};

export default NewPasswordForm;

"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import { NewPasswordSchema } from "@/schemas";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PasswordInput } from "../password-input";
import CardWrapper from "@/components/auth/card-wrapper";
import { Button } from "@/components/ui/button";
import { newPassword } from "@/actions/new-password";
import FormError from "@/components/form-error";
import FormSuccess from "@/components/form-success";

const NewPasswordForm = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [error, setError] = useState<{ message: string, date: Date }>({ message: "", date: new Date() });
  const [success, setSuccess] = useState<{ message: string, date: Date }>({ message: "", date: new Date() });
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof NewPasswordSchema>>({
    resolver: zodResolver(NewPasswordSchema),
    defaultValues: {
      password: "",
      passwordConfirmation: "",
    },
  });

  const onSubmit = (values: z.infer<typeof NewPasswordSchema>) => {
    startTransition(() => {
      newPassword(values, token).then((data) => {
        setError({ message: data?.error || "", date: new Date() });
        setSuccess({ message: data?.success || "", date: new Date() });
      });
    });

    form.reset();
    setSuccess({ message: "", date: new Date() });
    setError({ message: "", date: new Date() });
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
          {error && <FormError message={error.message} resetSignal={error.date.getTime()} />}
          {success && <FormSuccess message={success.message} resetSignal={success.date.getTime()} />}
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

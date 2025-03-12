"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";

import { ResetSchema } from "@/schemas";
import CardWrapper from "@/components/auth/card-wrapper";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";

import FormError from "@/components/form-error";
import FormSuccess from "@/components/form-success";
import { reset } from "@/actions/reset";

const ResetPasswordForm = () => {
  const [error, setError] = useState<{ message: string, date: Date }>({ message: "", date: new Date() });
  const [success, setSuccess] = useState<{ message: string, date: Date }>({ message: "", date: new Date() });
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof ResetSchema>>({
    resolver: zodResolver(ResetSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (values: z.infer<typeof ResetSchema>) => {
    setError({ message: "", date: new Date() });
    setSuccess({ message: "", date: new Date() });

    startTransition(() => {
      reset(values).then((data) => {
        setError({ message: data?.error || "", date: new Date() });
        setSuccess({ message: data?.success || "", date: new Date() });
      });
    });
  };

  return (
    <CardWrapper
      headerLabel="Forgot your password?"
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="your.email@example.com"
                      type="email"
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
            Send reset password email
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};

export default ResetPasswordForm;

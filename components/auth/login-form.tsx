"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { login } from "@/actions/login";
import { useIsClient } from "@/hooks/use-is-client";
import { LoginSchema } from "@/schemas";

import Spinner from "../spinner";
import CardWrapper from "./card-wrapper";
import FormError from "../form-error";
import FormSuccess from "../form-success";
import { PasswordInput } from "../password-input";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";

const LoginForm = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const urlError =
    searchParams.get("error") === "OAuthAccountNotLinked"
      ? "Email already in use with a different provider!"
      : "";

  const [showTwoFactor, setShowTwoFactor] = useState(false);

  const [error, setError] = useState<{ message: string, date: Date }>({ message: "", date: new Date() });
  const [success, setSuccess] = useState<{ message: string, date: Date }>({ message: "", date: new Date() });

  const [isPending, startTransition] = useTransition();

  const isClient = useIsClient();

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
      code: "",
    },
  });

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    startTransition(() => {
      try {
        login(values, callbackUrl).then((data) => {
          if (data?.error) {
            form.reset();
            setError({ message: data.error, date: new Date() });
          }

          if (data?.success) {
            form.reset();
            setSuccess({ message: data.success, date: new Date() });
          }

          if (data?.twoFactor) {
            setShowTwoFactor(true);
          }
        });
      } catch (err) {
        setError({ message: `Something went wrong! Error:${err}`, date: new Date() });
      } finally {
        setShowTwoFactor(false);
        setSuccess({ message: "", date: new Date() });
        setError({ message: "", date: new Date() });
      }
    });
  };

  if (!isClient) return <Spinner />;

  return (
    <CardWrapper
      headerLabel="Welcome back!"
      backButtonLabel="Don't have an account?"
      backButtonHref="/auth/register"
      showSocial
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <div className="space-y-4">
            {showTwoFactor && (
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Two Factor Authentication Code</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="123456"
                        type="text"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {!showTwoFactor && (
              <>
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
                          type="email"
                          placeholder="your.email@example.com"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                          type="password"
                          placeholder="******"
                        />
                      </FormControl>
                      <FormMessage />
                      <Button
                        size="sm"
                        variant="link"
                        asChild
                        className="px-0 text-muted-foreground"
                      >
                        <Link href="/auth/reset">Forgot your password?</Link>
                      </Button>
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>
          {error && <FormError message={error.message} resetSignal={error.date.getTime()} />}
          {success && <FormSuccess message={success.message} resetSignal={success.date.getTime()} />}
          <Button
            type="submit"
            disabled={isPending}
            className="w-full hover:bg-sky-400"
          >
            {showTwoFactor ? "Confirm" : "Login"}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};

export default LoginForm;

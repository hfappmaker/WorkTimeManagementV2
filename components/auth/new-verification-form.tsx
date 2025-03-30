"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { newVerification } from "@/actions/new-verification";
import CardWrapper from "@/components/auth/card-wrapper";
import FormError from "@/components/form-error";
import FormSuccess from "@/components/form-success";

import Spinner from "../spinner";

const NewVerificationForm = () => {
  const [error, setError] = useState<{ message: string, date: Date }>({ message: "", date: new Date() });
  const [success, setSuccess] = useState<{ message: string, date: Date }>({ message: "", date: new Date() });

  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  const onSubmit = useCallback(() => {
    if (success || error) return;

    if (!token) {
      setError({ message: "Missing token!", date: new Date() });
      return;
    }

    newVerification(token)
      .then((data) => {
        setSuccess({ message: data.success || "", date: new Date() });
        setError({ message: data.error || "", date: new Date() });
      })
      .catch(() => {
        setError({ message: "Something went wrong!", date: new Date() });
      });
  }, [token, success, error]);

  useEffect(() => {
    onSubmit();
  }, [onSubmit]);

  return (
    <CardWrapper
      headerLabel="Confirming your verification"
      backButtonLabel="Back to login"
      backButtonHref="/auth/login"
    >
      <div className="flex w-full items-center justify-center">
        {!success && !error && <Spinner />}
        {!success && <FormError message={error.message} resetSignal={error.date.getTime()} />}
        {success && <FormSuccess message={success.message} resetSignal={success.date.getTime()} />}
      </div>
    </CardWrapper>
  );
};

export default NewVerificationForm;

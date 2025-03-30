import { Suspense } from 'react'

import NewVerificationForm from "@/components/auth/new-verification-form";

export const metadata = {
  title: "Verification",
};

export default function NewVerificationPage() {
  return <Suspense><NewVerificationForm /></Suspense>;
}

import { Suspense } from 'react'

import NewVerificationForm from "@/features/auth/components/new-verification-form";

export const metadata = {
  title: "Verification",
};

export default function NewVerificationPage() {
  return <Suspense><NewVerificationForm /></Suspense>;
}

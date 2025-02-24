"use client";

import React from "react";
import Spinner from "@/components/spinner";

interface LoadingOverlayProps {
  isClient: boolean;
  isPending: boolean;
  children: React.ReactNode;
}

export default function LoadingOverlay({ isClient, isPending, children }: LoadingOverlayProps) {
  if (!isClient) return <Spinner />;
  return (
    <div className={`relative p-4 ${isPending ? "pointer-events-none opacity-50" : ""}`}>
      {children}
      {isPending && (
        <div className="absolute inset-0 flex items-center justify-center bg-opacity-40 z-10">
          <Spinner />
        </div>
      )}
    </div>
  );
}
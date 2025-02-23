import React from "react";

export interface ModalDialogProps {
  isOpen: boolean;
  title: string;
  children: React.ReactNode;
}

export default function ModalDialog({ isOpen, title, children }: ModalDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div
        className="bg-card text-card-foreground border border-border p-4 rounded shadow-lg w-1/2"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
} 
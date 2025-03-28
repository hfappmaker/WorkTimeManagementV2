"use client";

import { useRouter } from "next/navigation";

import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import LoginForm from "@/components/auth/login-form";
import { useTransitionContext } from "@/contexts/TransitionContext";

interface LoginButtonProps {
  children: React.ReactNode;
  mode?: "modal" | "redirect";
  asChild?: boolean;
}

const LoginButton = ({
  children,
  mode = "redirect",
  asChild,
}: LoginButtonProps) => {
  const router = useRouter();
  const { startTransition } = useTransitionContext();

  const handleLogin = () => {
    startTransition(() => {
      router.push("/auth/login");
    });
  };

  if (mode === "modal") {
    return (
      <Dialog>
        <DialogTrigger asChild={asChild}>{children}</DialogTrigger>
        <DialogContent className="p-0 w-auto bg-transparent border-none">
          <DialogHeader>
            <DialogTitle className="sr-only">ログイン</DialogTitle>
          </DialogHeader>
          <LoginForm />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <span
      onClick={handleLogin}
      className="cursor-pointer"
    >
      {children}
    </span>
  );
};

export default LoginButton;

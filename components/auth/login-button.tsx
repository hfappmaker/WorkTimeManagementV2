"use client";

import { useRouter } from "next/navigation";

import LoginForm from "@/components/auth/login-form";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTransitionContext } from "@/contexts/TransitionContext";

type LoginButtonProps = {
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
        <DialogContent className="w-auto border-none bg-transparent p-0">
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

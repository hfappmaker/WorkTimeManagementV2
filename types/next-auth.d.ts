import { UserRole } from "@prisma/client";
import { User as NextAuthUser } from "next-auth";

type User = {
  role: UserRole;
  isTwoFactorEnabled: boolean;
  isOAuth: boolean;
} & NextAuthUser;

declare module "next-auth" {
  type JWT = {
    role: UserRole;
    isTwoFactorEnabled: boolean;
    isOAuth: boolean;
  };

  type Session = {
    user: User & Session["user"];
  };
}

"use client";

import { logout } from "@/features/auth/actions/logout";

const LogoutButton = ({ children }: { children: React.ReactNode }) => {
  const handleLogout = async () => {
    await logout();
  };

  return (
    <span
      onClick={handleLogout}
      className="cursor-pointer"
    >
      {children}
    </span>
  );
};

export default LogoutButton;

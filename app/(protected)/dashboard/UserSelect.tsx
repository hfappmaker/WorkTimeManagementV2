"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  initialSelectedUser: string;
  children: React.ReactNode; // サーバーコンポーネントから受け取った SelectItem 群
}

export default function UserSelect({ initialSelectedUser, children }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedUser, setSelectedUser] = useState(initialSelectedUser);

  const handleUserChange = (value: string) => {
    setSelectedUser(value);
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set("userId", value);
    router.replace(`?${params.toString()}`);
  };

  return (
    <Select name="userId" defaultValue={selectedUser} onValueChange={handleUserChange}>
      <SelectTrigger className="w-[200px] truncate">
        <SelectValue placeholder="Select User" className="truncate" />
      </SelectTrigger>
      <SelectContent>
        {children}
      </SelectContent>
    </Select>
  );
} 
"use client";

import { useTheme } from "next-themes";
import { RiUserSettingsLine } from "react-icons/ri";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useIsClient } from "@/hooks/use-is-client";
import Spinner from "@/components/spinner";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const isClient = useIsClient();

  if (!isClient) return <Spinner />;

  return (
    <Card className="w-auto shadow-sm">
      <CardHeader className="flex-row items-center justify-center font-semibold gap-x-3">
        <RiUserSettingsLine className="text-sky-400 text-3xl" />
        <p className="text-2xl">設定</p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm gap-x-2">
          <div className="space-y-0.5">
            <p className="font-medium">ダークモード</p>
            <p className="text-sm text-muted-foreground">
              ダークモードの切り替えができます
            </p>
          </div>
          <Switch
            checked={theme === "dark"}
            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
          />
        </div>
      </CardContent>
    </Card>
  );
}

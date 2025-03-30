"use client";

import { useTheme } from "next-themes";
import { RiUserSettingsLine } from "react-icons/ri";

import Spinner from "@/components/spinner";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useIsClient } from "@/hooks/use-is-client";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const isClient = useIsClient();

  if (!isClient) return <Spinner />;

  return (
    <Card className="w-auto shadow-sm">
      <CardHeader className="flex-row items-center justify-center gap-x-3 font-semibold">
        <RiUserSettingsLine className="text-3xl text-sky-400" />
        <p className="text-2xl">設定</p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-row items-center justify-between gap-x-2 rounded-lg border p-3 shadow-sm">
          <div className="space-y-0.5">
            <p className="font-medium">ダークモード</p>
            <p className="text-sm text-muted-foreground">
              ダークモードの切り替えができます
            </p>
          </div>
          <Switch
            checked={theme === "dark"}
            onCheckedChange={(checked) => { setTheme(checked ? "dark" : "light"); }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

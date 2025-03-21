import { BsCalendarCheck } from "react-icons/bs";

import { Button } from "@/components/ui/button";
import LoginButton from "@/components/auth/login-button";

export default function Home() {
  return (
    <main className="flex h-full flex-col items-center justify-center">
      <div className="space-y-6 text-center">
        <div className="flex items-center justify-center">
          <BsCalendarCheck className="text-sky-400 text-8xl mr-4" />
          <h1 className="text-6xl font-semibold text-primary drop-shadow-md">
            勤怠管理システム
          </h1>
        </div>

        <div>
          <LoginButton>
            <Button
              className="bg-gradient-to-r from-sky-400 to-sky-500 text-primary hover:bg-gradient-to-l hover:from-sky-400 hover:to-sky-500"
              size="lg"
            >
              ログイン
            </Button>
          </LoginButton>
        </div>
      </div>
    </main>
  );
}

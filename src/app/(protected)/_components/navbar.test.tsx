import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter, usePathname } from "next/navigation";

import { useTransitionContext } from "@/contexts/transition-context";

import Navbar from "./navbar";

// モックの設定
jest.mock("next/navigation", () => ({
    useRouter: jest.fn(),
    usePathname: jest.fn(),
}));

jest.mock("@/contexts/transition-context", () => ({
    useTransitionContext: jest.fn(),
}));

jest.mock("@/features/auth/components/user-button", () => ({
    __esModule: true,
    default: () => <button data-testid="mock-user-button">Mocked Button</button>
}));

// テスト用のデータ
const mockRouter = {
    push: jest.fn(),
};

const mockStartTransition = jest.fn((callback) => callback());

describe("Navbar", () => {
    beforeEach(() => {
        // モックのリセットと初期設定
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
        (usePathname as jest.Mock).mockReturnValue("/");
        (useTransitionContext as jest.Mock).mockReturnValue({
            startTransition: mockStartTransition,
        });
    });

    it("デスクトップ表示で全てのナビゲーションリンクが表示される", () => {
        render(<Navbar />);
        const links = screen.getAllByRole("link");
        expect(links).toHaveLength(3); // NAV_LINKSの数に応じて調整
    });

    it("現在のパスに対応するリンクがアクティブになっている", () => {
        (usePathname as jest.Mock).mockReturnValue("/dashboard");
        render(<Navbar />);
        const activeLink = screen.getByText("ダッシュボード");
        expect(activeLink.closest('[role="link"]')).toHaveClass("bg-primary");
    });

    it("リンククリック時にトランジションとナビゲーションが実行される", async () => {
        render(<Navbar />);
        const link = screen.getByText("ダッシュボード");
        await userEvent.click(link);

        expect(mockStartTransition).toHaveBeenCalled();
        expect(mockRouter.push).toHaveBeenCalledWith("/dashboard");
    });

    it("モバイル表示でハンバーガーメニューが表示される", () => {
        render(<Navbar />);
        const menuButton = screen.getByRole("button", { name: /menu/i });
        expect(menuButton).toBeInTheDocument();
    });

    it("モバイルメニューを開くとナビゲーションリンクが表示される", async () => {
        render(<Navbar />);
        const menuButton = screen.getByRole("button", { name: /menu/i });
        await userEvent.click(menuButton);

        const links = screen.getAllByRole("link");
        expect(links).toHaveLength(3); // NAV_LINKSの数に応じて調整
    });

    it("UserButtonコンポーネントが表示される", () => {
        render(<Navbar />);
        const userButton = screen.getByTestId("user-button");
        expect(userButton).toBeInTheDocument();
    });

    // レスポンシブデザインのテスト
    it("デスクトップ表示とモバイル表示で適切なクラスが適用される", () => {
        render(<Navbar />);
        const desktopNav = screen.getByRole("navigation", { hidden: true });
        const mobileNav = screen.getByRole("navigation", { hidden: false });

        expect(desktopNav).toHaveClass("hidden lg:flex");
        expect(mobileNav).toHaveClass("lg:hidden");
    });
}); 
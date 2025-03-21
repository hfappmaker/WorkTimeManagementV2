import SettingsPage from "./page.client";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "設定",
    description: "設定",
};

export default async function SettingsPage() {
    return <SettingsPage />;
}

import { getContractByIdAction } from "@/actions/contract";
import { currentUser } from "@/lib/auth";
import ClientContractPage from "./page.client";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "契約詳細",
    description: "契約詳細",
};

export default async function ContractPage({ params }: { params: Promise<{ contractId: string }> }) {
    const { contractId } = await params;
    const user = await currentUser();
    const contract = await getContractByIdAction(contractId);
    if (!contract || contract.client.createUserId !== user?.id) {
        return notFound();
    }
    return (
        <ClientContractPage contractId={contractId} />
    );
}

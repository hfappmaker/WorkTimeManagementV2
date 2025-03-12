import { getContractByIdAction } from "@/actions/formAction";
import { currentUser } from "@/lib/auth";
import ClientContractPage from "./page.client";
import { notFound } from "next/navigation";
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

import ClientContractPage from "./page.client";

export default async function ContractPage({ params }: { params: Promise<{ contractId: string }> }) {
    const { contractId } = await params;
    return (
        <ClientContractPage contractId={contractId} />
    );
}

import WorkTimeReportClient from "./page.client";

export default async function WorkTimeReport({ params: { contractId } }: { params: { contractId: string } }) {
    return (
        <WorkTimeReportClient contractId={contractId} />
    );
}

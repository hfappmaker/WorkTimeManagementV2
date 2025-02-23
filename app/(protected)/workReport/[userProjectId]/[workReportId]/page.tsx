import WorkReportClient from "./page.client";
export default async function WorkReport({ params: { userProjectId, workReportId } }: { params: { userProjectId: string, workReportId: string } }) {
    return (
        <WorkReportClient userProjectId={userProjectId} workReportId={workReportId} />
    );
}

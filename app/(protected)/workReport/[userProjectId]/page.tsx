import WorkTimeReportClient from "./page.client";

export default async function WorkTimeReport({ params: { userProjectId } }: { params: { userProjectId: string } }) {
    return (
        <WorkTimeReportClient userProjectId={userProjectId} />
    );
}

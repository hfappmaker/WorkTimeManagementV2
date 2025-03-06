import LoadingOverlay from "@/components/LoadingOverlay";
import { useIsClient } from "@/hooks/use-is-client";

export default function DashboardPage() {
    const isClient = useIsClient();

    return (
        <LoadingOverlay isClient={isClient} isPending={false}>
            <div>
                <h1>Dashboard</h1>
            </div>
        </LoadingOverlay>
    )
}
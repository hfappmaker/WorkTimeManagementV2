'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from "next/navigation";
import { useCurrentUser } from '@/hooks/use-current-user';
import { getWorkTimesByUserIdAndProjectId } from '@/data/work-time';

interface WorkTime {
    id: string;
    startTime: Date;
    endTime: Date;
    userProjectUserId: string;
    userProjectProjectId: string;
}

export default function DashboardPage() {
    const [workTimes, setWorkTimes] = useState<WorkTime[]>([]);
    const searchParams = useSearchParams();
    const projectId = searchParams.get("projectId") ?? "";
    useEffect(() => {
        const fetchData = async () => {
            const user = useCurrentUser();
            const workTimes = await getWorkTimesByUserIdAndProjectId(user.id, projectId);
            if (workTimes) setWorkTimes(workTimes);
        }

        fetchData();
    }, []);

    return (
        <div>
            <h2>Work Time List</h2>
            <ul>
                {workTimes.map((workTime) => (
                    <li key={workTime.id}>
                        <p>{workTime.startTime.toDateString()}</p>
                        <p>{workTime.endTime.toDateString()}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};


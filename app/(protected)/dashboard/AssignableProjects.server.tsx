import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Project } from "@prisma/client";

interface Props {
  assignableProjects: Project[];
}

export default function AssignableProjects({ assignableProjects }: Props) {
  if (assignableProjects.length === 0) {
    return <p>No assignable projects available.</p>;
  }

  return (
    <Select name="projectId" defaultValue={assignableProjects[0].id}>
      <SelectTrigger className="w-[200px] truncate">
        <SelectValue placeholder="Select Unassigned Project" className="truncate" />
      </SelectTrigger>
      <SelectContent>
        {assignableProjects.map((project) => (
          <SelectItem key={project.id} value={project.id}>
            {project.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
} 
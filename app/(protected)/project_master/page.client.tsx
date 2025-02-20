'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState, useTransition, useEffect } from "react";
import { z } from "zod";
import { ProjectMasterSchema } from "@/schemas";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createProjectAction, searchProjectsAction, deleteProjectAction, updateProjectAction } from "@/actions/formAction";
import FormError from "@/components/form-error";
import FormSuccess from "@/components/form-success";
import Spinner from "@/components/spinner";

export default function ProjectMasterClient() {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    type Project = {
      id: string;
      projectName: string;
      assigned: boolean;
    };

    const [projects, setProjects] = useState<Project[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [editProjectId, setEditProjectId] = useState<string | null>(null);
    const [editProjectName, setEditProjectName] = useState("");

    const form = useForm<z.infer<typeof ProjectMasterSchema>>({
        resolver: zodResolver(ProjectMasterSchema),
        defaultValues: {
            projectName: "",
        },
    });

    const loadProjects = async () => {
      setLoading(true);
      try {
          const results = await searchProjectsAction("");
          setProjects(results.map(result => ({
            id: result.id,
            projectName: result.name,
            assigned: result.userProjects.length > 0
          })));
      } catch (error) {
          setError("Failed to fetch projects");
          setTimeout(() => setError(""), 3000);
      } finally {
          setLoading(false);
      }
    };

    useEffect(() => {
        loadProjects();
    }, []);

    const onSubmit = (values: z.infer<typeof ProjectMasterSchema>) => {
        startTransition(async () => {
            try {
                await createProjectAction(values.projectName);
                form.reset();
                setSuccess(`Project ${values.projectName} created successfully`);
                setTimeout(() => setSuccess(""), 3000);
                loadProjects();
            } catch (error) {
                setError("Failed to create project");
                setTimeout(() => setError(""), 3000);
            }
        });
    };

    const handleSearch = async () => {
      setLoading(true);
      try {
          const results = await searchProjectsAction(searchQuery);
          setProjects(results.map(result => ({
            id: result.id,
            projectName: result.name,
            assigned: result.userProjects.length > 0
          })));
      } catch (error) {
          setError("Failed to search projects");
          setTimeout(() => setError(""), 3000);
      } finally {
          setLoading(false);
      }
    };

    const handleDelete = (id: string) => {
        startTransition(async () => {
             try {
                 await deleteProjectAction(id);
                 setProjects(prev => prev.filter(project => project.id !== id));
                 setSuccess(`Project ${projects.find(p => p.id === id)?.projectName} deleted successfully`);
                 setTimeout(() => setSuccess(""), 3000);
             } catch (error) {
                 setError("Failed to delete project");
                 setTimeout(() => setError(""), 3000);
             }
        });
    };

    const handleEdit = (project: Project) => {
        setEditProjectId(project.id);
        setEditProjectName(project.projectName);
    };

    const handleEditSave = (id: string) => {
        startTransition(async () => {
             try {
                 await updateProjectAction(id, editProjectName);
                 setProjects(prev =>
                     prev.map(project =>
                         project.id === id ? { ...project, projectName: editProjectName } : project
                     )
                 );
                 setEditProjectId(null);
                 setEditProjectName("");
             } catch (error) {
                 setError("Failed to update project");
                 setTimeout(() => setError(""), 3000);
             }
        });
    };

    const handleEditCancel = () => {
        setEditProjectId(null);
        setEditProjectName("");
    };

    return (
        <div className="relative">
            <div className={`flex flex-col gap-6 ${isPending ? "pointer-events-none opacity-50" : ""}`}>
                {error && <FormError message={error} />}
                {success && <FormSuccess message={success} />}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField
                            control={form.control}
                            name="projectName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Project Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Enter Project Name" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit">
                            Create Project
                        </Button>
                    </form>
                </Form>

                <div>
                    <h2>Search Projects</h2>
                    <div className="flex gap-2 items-center">
                        <Input 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search Projects"
                        />
                        <Button onClick={handleSearch}>Search</Button>
                    </div>
                </div>

                <div>
                    <h2>Project List</h2>
                    {loading ? (
                        <div className="flex items-center justify-center h-20">
                            <Spinner />
                        </div>
                    ) : projects.length === 0 ? (
                        <p>No projects found.</p>
                    ) : (
                        <ul className="list-none p-0">
                            {projects.map((project) => (
                                <li
                                    key={project.id}
                                    className="mb-2 flex items-center gap-2"
                                >
                                    {editProjectId === project.id ? (
                                        <>
                                            <Input
                                                value={editProjectName}
                                                onChange={(e) => setEditProjectName(e.target.value)}
                                            />
                                            <Button onClick={() => handleEditSave(project.id)}>Save</Button>
                                            <Button onClick={handleEditCancel}>Cancel</Button>
                                        </>
                                    ) : (
                                        <>
                                            <span className="overflow-hidden text-ellipsis whitespace-nowrap w-200">{project.projectName}</span>
                                            <Button onClick={() => handleEdit(project)}>Edit</Button>
                                            {project.assigned ? (
                                                <Button disabled title="Cannot delete assigned project">
                                                    Delete
                                                </Button>
                                            ) : (
                                                <Button onClick={() => handleDelete(project.id)}>Delete</Button>
                                            )}
                                        </>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
            {isPending && (
                <div className="absolute inset-0 flex items-center justify-center bg-opacity-40 z-10">
                    <Spinner />
                </div>
            )}
        </div>
    );
}
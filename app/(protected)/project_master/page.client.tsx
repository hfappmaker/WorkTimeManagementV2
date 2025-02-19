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

export default function ProjectMasterClient() {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

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
      try {
          const results = await searchProjectsAction("");
          setProjects(results);
      } catch (error) {
          setError("Failed to fetch projects");
          setTimeout(() => setError(""), 3000);
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
                setSuccess("Project created successfully");
                setTimeout(() => setSuccess(""), 3000);
                loadProjects();
            } catch (error) {
                setError("Failed to create project");
                setTimeout(() => setError(""), 3000);
            }
        });
    };

    const handleSearch = async () => {
      try {
          const results = await searchProjectsAction(searchQuery);
          setProjects(results);
      } catch (error) {
          setError("Failed to search projects");
          setTimeout(() => setError(""), 3000);
      }
    };

    const handleDelete = (id: string) => {
        startTransition(async () => {
             try {
                 await deleteProjectAction(id);
                 setProjects(prev => prev.filter(project => project.id !== id));
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
        <>
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
                    {error && <FormError message={error} />}
                    {success && <FormSuccess message={success} />}
                    <Button type="submit" disabled={isPending}>
                        {isPending ? "Creating..." : "Create Project"}
                    </Button>
                </form>
            </Form>

            <div style={{ marginTop: "20px" }}>
              <h2>Search Projects</h2>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <Input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Projects"
                />
                <Button onClick={handleSearch}>Search</Button>
              </div>
            </div>

            <div style={{ marginTop: "20px" }}>
              <h2>Project List</h2>
              {projects.length === 0 ? (
                  <p>No projects found.</p>
              ) : (
                  <ul style={{ listStyle: "none", padding: 0 }}>
                      {projects.map((project) => (
                          <li
                              key={project.id}
                              style={{
                                  marginBottom: "10px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "10px",
                              }}
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
                                      <span>{project.projectName}</span>
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
        </>
    );
}
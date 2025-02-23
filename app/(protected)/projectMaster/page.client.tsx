'use client';

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/spinner";
import FormError from "@/components/form-error";
import FormSuccess from "@/components/form-success";
import ModalDialog from "@/components/ModalDialog";
import { truncate } from "@/lib/utils";
import {
  createProjectAction,
  searchProjectsAction,
  deleteProjectAction,
  updateProjectAction,
} from "@/actions/formAction";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

type Project = {
  id: string;
  projectName: string;
  assigned: boolean;
};

// DialogType に "details" を追加
type DialogType = "create" | "edit" | "delete" | "details" | null;

export default function ProjectMasterClient() {
  const [isPending, startTransition] = useTransition();
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 共通のダイアログ状態
  const [activeDialog, setActiveDialog] = useState<DialogType>(null);
  // 選択したプロジェクトを管理
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  const loadProjects = () => {
    startTransition(async () => {
      try {
        const results = await searchProjectsAction(searchQuery);
        setProjects(
          results.map((result) => ({
            id: result.id,
            projectName: result.name,
            assigned: result.userProjects.length > 0,
          }))
        );
      } catch (err) {
        setError("Failed to fetch projects");
      }
    });
  };

  const handleSearch = () => {
    loadProjects();
  };

  // プロジェクト行をクリックすると詳細ダイアログを表示する
  const openDetailsDialog = (project: Project) => {
    setActiveProject(project);
    setActiveDialog("details");
  };

  // ----- 以下、Form コンポーネントを利用したリファクタリング -----

  // Create用フォーム（projectNameのみ）
  const createForm = useForm<{ projectName: string }>({
    defaultValues: { projectName: "" },
  });

  // Edit用フォーム
  const editForm = useForm<{ projectName: string }>({
    defaultValues: { projectName: "" },
  });

  useEffect(() => {
    if (activeDialog === "edit" && activeProject) {
      editForm.reset({ projectName: activeProject.projectName });
    }
  }, [activeDialog, activeProject, editForm]);

  const onCreateProject = (data: { projectName: string }) => {
    if (!data.projectName.trim()) {
      createForm.setError("projectName", { message: "Project name cannot be empty" });
      return;
    }
    startTransition(async () => {
      try {
        await createProjectAction(data.projectName);
        setSuccess(`Project '${truncate(data.projectName, 20)}' created successfully`);
        createForm.reset();
        setActiveDialog(null);
        loadProjects();
      } catch (err) {
        createForm.setError("projectName", { message: "Failed to create project" });
      }
    });
  };

  const onEditProject = (data: { projectName: string }) => {
    if (!data.projectName.trim()) {
      editForm.setError("projectName", { message: "Project name cannot be empty" });
      return;
    }
    if (!activeProject) return;
    startTransition(async () => {
      try {
        await updateProjectAction(activeProject.id, data.projectName);
        setSuccess("Project edited successfully");
        setActiveDialog(null);
        setActiveProject(null);
        editForm.reset();
        loadProjects();
      } catch (err) {
        editForm.setError("projectName", { message: "Failed to update project" });
      }
    });
  };

  // Delete の場合はフォームを使わずに現在の実装のままとする

  return (
    <div className={`relative p-4 ${isPending ? "pointer-events-none opacity-50" : ""}`}>
      {!activeDialog && error && <FormError message={error} />}
      {success && <FormSuccess message={success} />}
      <div className="flex items-center gap-2 mb-4">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Projects"
          className="w-64"
        />
        <Button onClick={handleSearch}>Search</Button>
        <Button onClick={() => setActiveDialog("create")} className="ml-auto">
          Create Project
        </Button>
      </div>
      {projects.length === 0 ? (
        <p>No projects found.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {projects.map((project) => (
            <li
              key={project.id}
              className="flex items-center justify-between py-2 cursor-pointer hover:text-blue-500"
              onClick={() => openDetailsDialog(project)}
            >
              <span className="truncate max-w-[300px]">{project.projectName}</span>
            </li>
          ))}
        </ul>
      )}
      {/* プロジェクト概要表示のダイアログ */}
      <ModalDialog isOpen={activeDialog === "details"} title="Project Overview">
        <div>
          <p>
            <strong>ID:</strong> {activeProject?.id}
          </p>
          <p>
            <strong>Name:</strong> {activeProject?.projectName}
          </p>
          <p>
            <strong>Assigned:</strong> {activeProject?.assigned ? "Yes" : "No"}
          </p>
        </div>
        <div className="flex justify-end mt-4 gap-2">
          <Button
            onClick={() => {
              setActiveDialog(null);
              setActiveProject(null);
            }}
          >
            Close
          </Button>
          <Button
            onClick={() => setActiveDialog("edit")}
          >
            Edit
          </Button>
          {activeProject && activeProject.assigned ? (
            <div title="このプロジェクトは割り当てられているため削除できません">
              <Button disabled>Delete</Button>
            </div>
          ) : (
            <Button onClick={() => setActiveDialog("delete")}>Delete</Button>
          )}
        </div>
      </ModalDialog>
      
      {/* Create Dialog (Form コンポーネント利用) */}
      <ModalDialog isOpen={activeDialog === "create"} title="Create Project">
        <Form {...createForm}>
          <form onSubmit={createForm.handleSubmit(onCreateProject)}>
            <FormField
              control={createForm.control}
              name="projectName"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter project name" />
                  </FormControl>
                  <FormMessage>{fieldState.error?.message}</FormMessage>
                </FormItem>
              )}
            />
            <div className="flex justify-end mt-4 gap-2">
              <Button
                type="button"
                onClick={() => {
                  setActiveDialog(null);
                  createForm.reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">OK</Button>
            </div>
          </form>
        </Form>
      </ModalDialog>
      
      {/* Edit Dialog (Form コンポーネント利用) */}
      <ModalDialog isOpen={activeDialog === "edit"} title="Edit Project">
        <Form {...editForm}>
          <form onSubmit={editForm.handleSubmit(onEditProject)}>
            <FormField
              control={editForm.control}
              name="projectName"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter new project name" />
                  </FormControl>
                  <FormMessage>{fieldState.error?.message}</FormMessage>
                </FormItem>
              )}
            />
            <div className="flex justify-end mt-4 gap-2">
              <Button
                type="button"
                onClick={() => {
                  setActiveDialog(null);
                  setActiveProject(null);
                  editForm.reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">OK</Button>
            </div>
          </form>
        </Form>
      </ModalDialog>
      
      {/* Delete Dialog は現行実装のまま */}
      <ModalDialog isOpen={activeDialog === "delete"} title="Delete Project">
        <p>
          Are you sure you want to delete{" "}
          <span className="font-bold">{truncate(activeProject?.projectName || "", 20)}</span>?
        </p>
        <div className="flex justify-end mt-4 gap-2">
          <Button
            onClick={() => {
              setActiveDialog(null);
              setActiveProject(null);
            }}
          >
            Cancel
          </Button>
          <Button onClick={() => {
            if (activeProject) {
              startTransition(async () => {
                try {
                  await deleteProjectAction(activeProject.id);
                  setSuccess(`Project '${truncate(activeProject.projectName, 20)}' deleted successfully`);
                  setActiveDialog(null);
                  setActiveProject(null);
                  loadProjects();
                } catch (err) {
                  // エラーハンドリング
                }
              });
            }
          }}>Delete</Button>
        </div>
      </ModalDialog>
      
      {isPending && (
        <div className="absolute inset-0 flex items-center justify-center bg-opacity-40 z-10">
          <Spinner />
        </div>
      )}
    </div>
  );
}
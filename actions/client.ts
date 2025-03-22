"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ClientSchema } from "@/schemas";
import {
  getClientById,
  getClientsByUserId,
  createClient,
  updateClient,
  deleteClient,
} from "@/data/client";

export const getClientByIdAction = async (clientId: string) => {
  try {
    return await getClientById(clientId);
  } catch (error) {
    console.error("Error fetching client:", error);
    throw new Error("Failed to fetch client details");
  }
};

export const getClientsByUserIdAction = async (userId: string) => {
  try {
    return await getClientsByUserId(userId);
  } catch (error) {
    console.error("Error fetching clients:", error);
    throw new Error("Failed to fetch clients");
  }
};

export const createClientAction = async (
  values: z.infer<typeof ClientSchema>
) => {
  await createClient(values);
  revalidatePath("/client");
};

export const updateClientAction = async (
  id: string,
  values: z.infer<typeof ClientSchema>
) => {
  await updateClient(id, values);
  revalidatePath("/client");
};

export const deleteClientAction = async (id: string) => {
  await deleteClient(id);
  revalidatePath("/client");
}; 
"use server";

import { revalidatePath } from "next/cache";
import { StrictOmit } from "ts-essentials";

import { Client } from "@/features/client/types/client";
import {
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getClientsByUserId,
} from "@/repositories/client/client-repository";

export const getClientByIdAction = async (
  clientId: string,
): Promise<Client | null> => {
  try {
    const client = await getClientById(clientId);
    return client;
  } catch (error) {
    console.error("Error fetching client:", error);
    throw new Error("Failed to fetch client details");
  }
};

export const getClientsByUserIdAction = async (
  userId: string,
): Promise<Client[]> => {
  try {
    const clients = await getClientsByUserId(userId);
    return clients;
  } catch (error) {
    console.error("Error fetching clients:", error);
    throw new Error("Failed to fetch clients");
  }
};

export const createClientAction = async (
  values: StrictOmit<Client, "id">,
): Promise<Client> => {
  const client = await createClient(values);
  revalidatePath("/client");
  return client;
};

export const updateClientAction = async (
  id: string,
  values: StrictOmit<Client, "id">,
): Promise<Client> => {
  const client = await updateClient(id, values);
  revalidatePath("/client");
  return client;
};

export const deleteClientAction = async (id: string): Promise<void> => {
  await deleteClient(id);
  revalidatePath("/client");
};

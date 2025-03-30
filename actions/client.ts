"use server";

import { Client as PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { StrictOmit } from "ts-essentials";

import {
  getClientById,
  getClientsByUserId,
  createClient,
  updateClient,
  deleteClient,
} from "@/data/client";
import { Client } from "@/types/client";

function convertPrismaClientToClient(values: PrismaClient): Client {
  const { defaultEmailTemplateId, ...rest } = values;

  return {
    defaultEmailTemplateId: defaultEmailTemplateId ?? undefined,
    ...rest,
  };
}

function convertClientToPrismaClient(
  values: StrictOmit<Client, "id">
): StrictOmit<PrismaClient, "id"> {
  const { defaultEmailTemplateId, ...rest } = values;

  return {
    defaultEmailTemplateId: defaultEmailTemplateId ?? null,
    ...rest,
  };
}

export const getClientByIdAction = async (
  clientId: string
): Promise<Client | null> => {
  try {
    const client = await getClientById(clientId);
    return client ? convertPrismaClientToClient(client) : null;
  } catch (error) {
    console.error("Error fetching client:", error);
    throw new Error("Failed to fetch client details");
  }
};

export const getClientsByUserIdAction = async (
  userId: string
): Promise<Client[]> => {
  try {
    const clients = await getClientsByUserId(userId);
    return clients.map(convertPrismaClientToClient);
  } catch (error) {
    console.error("Error fetching clients:", error);
    throw new Error("Failed to fetch clients");
  }
};

export const createClientAction = async (
  values: StrictOmit<Client, "id">
): Promise<Client> => {
  const client = await createClient(convertClientToPrismaClient(values));
  revalidatePath("/client");
  return convertPrismaClientToClient(client);
};

export const updateClientAction = async (
  id: string,
  values: StrictOmit<Client, "id">
): Promise<Client> => {
  const client = await updateClient(id, convertClientToPrismaClient(values));
  revalidatePath("/client");
  return convertPrismaClientToClient(client);
};

export const deleteClientAction = async (id: string): Promise<void> => {
  await deleteClient(id);
  revalidatePath("/client");
};

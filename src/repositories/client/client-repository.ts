import { Client as PrismaClient } from "@prisma/client";
import { StrictOmit } from "ts-essentials";

import { Client } from "@/features/client/types/client";
import { db } from "@/lib/db";

function convertPrismaClientToClient(values: PrismaClient): Client {
  const { defaultEmailTemplateId, ...rest } = values;

  return {
    defaultEmailTemplateId: defaultEmailTemplateId ?? undefined,
    ...rest,
  };
}

export async function getClientsByUserId(userId: string): Promise<Client[]> {
  const clients = await db.client.findMany({
    where: { createUserId: userId },
  });
  return clients.map(convertPrismaClientToClient);
}

export async function getClientById(clientId: string): Promise<Client | null> {
  const client = await db.client.findUnique({
    where: { id: clientId },
  });
  return client ? convertPrismaClientToClient(client) : null;
}

export async function createClient(
  values: StrictOmit<Client, "id">,
): Promise<Client> {
  const client = await db.client.create({
    data: {
      name: values.name,
      contactName: values.contactName || "",
      email: values.email || "",
      createUser: {
        connect: {
          id: values.createUserId,
        },
      },
      ...(values.defaultEmailTemplateId
        ? {
            defaultEmailTemplate: {
              connect: {
                id: values.defaultEmailTemplateId,
              },
            },
          }
        : {}),
    },
  });
  return convertPrismaClientToClient(client);
}

export async function updateClient(
  id: string,
  values: StrictOmit<Client, "id">,
): Promise<Client> {
  const client = await db.client.update({
    where: { id },
    data: {
      name: values.name,
      contactName: values.contactName,
      email: values.email,
      defaultEmailTemplateId: values.defaultEmailTemplateId,
    },
  });
  return convertPrismaClientToClient(client);
}

export async function deleteClient(id: string): Promise<void> {
  await db.client.delete({
    where: { id },
  });
}

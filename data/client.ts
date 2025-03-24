import { db } from "@/lib/db";
import { Client } from "@prisma/client";

export async function getClientsByUserId(userId: string) {
  const clients = await db.client.findMany({
    where: { createUserId: userId },
  });
  return clients;
}

export async function getClientById(clientId: string) {
  const client = await db.client.findUnique({
    where: { id: clientId },
  });
  return client;
}

export async function createClient(values: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) {
  await db.client.create({
    data: {
      name: values.name,
      contactName: values.contactName || "",
      email: values.email || "",
      createUser: {
        connect: {
          id: values.createUserId,
        },
      },
      ...(values.defaultEmailTemplateId ? {
        defaultEmailTemplate: {
          connect: {
            id: values.defaultEmailTemplateId,
          },
        },
      } : {}),
    },
  });
}

export async function updateClient(id: string, values: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) {
  await db.client.update({
    where: { id },
    data: { name: values.name, contactName: values.contactName || "", email: values.email || "", defaultEmailTemplateId: values.defaultEmailTemplateId || null },
  });
}

export async function deleteClient(id: string) {
  await db.client.delete({
    where: { id },
  });
}
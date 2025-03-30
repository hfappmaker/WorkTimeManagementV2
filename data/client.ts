import { Client } from "@prisma/client";
import { StrictOmit } from "ts-essentials";

import { db } from "@/lib/db";

export async function getClientsByUserId(userId: string) : Promise<Client[]> {
  const clients = await db.client.findMany({
    where: { createUserId: userId },
  });
  return clients;
}

export async function getClientById(clientId: string) : Promise<Client | null> {
  const client = await db.client.findUnique({
    where: { id: clientId },
  });
  return client;
}

export async function createClient(values: StrictOmit<Client, 'id'>) : Promise<Client> {
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
      ...(values.defaultEmailTemplateId ? {
        defaultEmailTemplate: {
          connect: {
            id: values.defaultEmailTemplateId,
          },
        },
      } : {}),
    },
  });
  return client;
}

export async function updateClient(id: string, values: StrictOmit<Client, 'id'>) : Promise<Client> {
  const client = await db.client.update({
    where: { id },
    data: { name: values.name, contactName: values.contactName || "", email: values.email || "", defaultEmailTemplateId: values.defaultEmailTemplateId || null },
  });
  return client;
}

export async function deleteClient(id: string) : Promise<void> {
  await db.client.delete({
    where: { id },
  });
}
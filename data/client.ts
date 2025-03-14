import { db } from "@/lib/db";
import { ClientSchema } from "@/schemas";
import { z } from "zod";

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

export async function createClient(values: z.infer<typeof ClientSchema>) {
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
    },
  });
}

export async function updateClient(id: string, values: z.infer<typeof ClientSchema>) {
  await db.client.update({
    where: { id },
    data: { name: values.name, contactName: values.contactName || "", email: values.email || "" },
  });
}

export async function deleteClient(id: string) {
  await db.client.delete({
    where: { id },
  });
}
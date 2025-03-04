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
    include: {
      contracts: true,
    },
  });
  return client;
}

export async function createClient(values: z.infer<typeof ClientSchema>) {
  await db.client.create({
    data: {
      name: values.name,
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
    data: { name: values.name },
  });
}

export async function deleteClient(id: string) {
  await db.client.delete({
    where: { id },
  });
}
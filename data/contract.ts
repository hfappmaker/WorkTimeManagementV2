import { db } from "@/lib/db";
import { ContractSchema } from "@/schemas";
import { z } from "zod";

export async function getContractsByUserId(userId: string) {
  const contracts = await db.contract.findMany({
    where: { client: { createUserId: userId } },
  });
  return contracts;
}

export async function getContractsByClientId(clientId: string) {
  const contracts = await db.contract.findMany({
    where: { clientId: clientId },
  });
  return contracts;
}

export async function getContractById(contractId: string) {
  const contract = await db.contract.findUnique({
    where: { id: contractId },
    include: {
      client: true,
    },
  });
  return contract;
}

export async function createContract(values: z.infer<typeof ContractSchema>) {
  const {
    clientId,
    userId,
    ...rest
  } = values;

  await db.contract.create({
    data: {
      ...rest,
      client: {
        connect: {
          id: clientId,
        },
      },
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export async function searchContracts(userId: string, searchQuery: string) {
  const contracts = await db.contract.findMany({
    where: {
      AND: [
        { name: { contains: searchQuery, mode: "insensitive" } },
        { client: { createUserId: userId } },
      ],
    },
  });
  return contracts;
}

export async function updateContract(
  id: string,
  values: z.infer<typeof ContractSchema>
) {
  const {
    clientId,
    userId,
    ...rest
  } = values;

  await db.contract.update({
    where: { id },
    data: {
      ...rest,
      client: {
        connect: {
          id: clientId,
        },
      },
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export async function deleteContract(id: string) {
  await db.contract.delete({
    where: { id },
  });
}

import { Contract } from "@prisma/client";
import { StrictOmit } from "ts-essentials";

import { db } from "@/lib/db";

function processContractValues(values: StrictOmit<Contract, 'id'>) {
  const {
    clientId,
    userId,
    ...rest
  } = values;

  const processedRest = Object.entries(values).reduce((acc, [key, schema]) => {
    if (key !== 'clientId' && key !== 'userId') {
      acc[key as keyof typeof rest] = rest[key as keyof typeof rest] ?? null;
    }
    return acc;
  }, {} as Record<keyof typeof rest, any>);

  return {
    processedRest,
    clientId,
    userId
  };
}

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

export async function createContract(values: StrictOmit<Contract, 'id'>) {
  const { processedRest, clientId, userId } = processContractValues(values);

  await db.contract.create({
    data: {
      ...processedRest,
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
  values: StrictOmit<Contract, 'id'>
) {
  const { processedRest, clientId, userId } = processContractValues(values);

  await db.contract.update({
    where: { id },
    data: {
      ...processedRest,
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

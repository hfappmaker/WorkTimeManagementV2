import { Contract } from "@prisma/client";
import { StrictOmit } from "ts-essentials";

import { db } from "@/lib/db";

function processContractValues(values: StrictOmit<Contract, "id">) {
  const { clientId, userId } = values;

  const processedRest = Object.entries(values).reduce<Record<string, unknown>>(
    (acc, [key, value]) => {
      if (key !== "clientId" && key !== "userId") {
        acc[key] = value ?? null;
      }
      return acc;
    },
    {},
  );

  return {
    processedRest,
    clientId,
    userId,
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

export async function createContract(values: StrictOmit<Contract, "id">) {
  const { processedRest, clientId, userId } = processContractValues(values);

  await db.contract.create({
    data: {
      ...(processedRest as StrictOmit<Contract, "id" | "clientId" | "userId">),
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
  values: StrictOmit<Contract, "id">,
) {
  const { processedRest, clientId, userId } = processContractValues(values);

  await db.contract.update({
    where: { id },
    data: {
      ...(processedRest as StrictOmit<Contract, "id" | "clientId" | "userId">),
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

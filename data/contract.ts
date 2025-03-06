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
  await db.contract.create({
    data: {
      ...values,
      closingDay: values.closingDay
        ? parseInt(values.closingDay as string)
        : null,
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
  await db.contract.update({
    where: { id },
    data: {
      ...values,
      closingDay: values.closingDay
        ? parseInt(values.closingDay as string)
        : null,
    },
  });
}

export async function deleteContract(id: string) {
  await db.contract.delete({
    where: { id },
  });
}

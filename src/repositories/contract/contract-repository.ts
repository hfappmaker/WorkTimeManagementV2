import { Contract as PrismaContract, Prisma } from "@prisma/client";
import { StrictOmit } from "ts-essentials";

import { Contract, ContractInput } from "@/features/contract/types/contract";
import { db } from "@/lib/db";
import { Serialize } from "@/utils/serialization/serialization-utils";

type ContractOutput = StrictOmit<PrismaContract, "id">;

const transformContractData = (values: ContractInput): ContractOutput => {
  return {
    ...values,
    unitPrice: values.unitPrice ? new Prisma.Decimal(values.unitPrice) : null,
    settlementMin: values.settlementMin
      ? new Prisma.Decimal(values.settlementMin)
      : null,
    settlementMax: values.settlementMax
      ? new Prisma.Decimal(values.settlementMax)
      : null,
    upperRate: values.upperRate ? new Prisma.Decimal(values.upperRate) : null,
    lowerRate: values.lowerRate ? new Prisma.Decimal(values.lowerRate) : null,
    middleRate: values.middleRate
      ? new Prisma.Decimal(values.middleRate)
      : null,
    basicStartTime: values.basicStartTime
      ? new Date(values.basicStartTime)
      : null,
    basicEndTime: values.basicEndTime ? new Date(values.basicEndTime) : null,
    basicBreakDuration: values.basicBreakDuration
      ? Number(values.basicBreakDuration)
      : null,
    closingDay: values.closingDay ? Number(values.closingDay) : null,
    monthlyWorkMinutes: values.monthlyWorkMinutes
      ? Number(values.monthlyWorkMinutes)
      : null,
    dailyWorkMinutes: values.dailyWorkMinutes
      ? Number(values.dailyWorkMinutes)
      : null,
    endDate: values.endDate ? new Date(values.endDate) : null,
  };
};

const convertPrismaContractToContract = (
  contract: PrismaContract,
): Contract => {
  return Serialize(contract);
};

function processContractValues(values: StrictOmit<PrismaContract, "id">) {
  const { clientId, userId } = values;

  const processedRest = Object.entries(values).reduce<Record<string, unknown>>(
    (acc, [key, value]) => {
      if (key !== "clientId" && key !== "userId") {
        acc[key] = value;
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
  return contracts.map(convertPrismaContractToContract);
}

export async function getContractsByClientId(clientId: string) {
  const contracts = await db.contract.findMany({
    where: { clientId: clientId },
  });
  return contracts.map(convertPrismaContractToContract);
}

export async function getContractById(contractId: string) {
  const contract = await db.contract.findUnique({
    where: { id: contractId },
    include: {
      client: true,
    },
  });
  return contract ? convertPrismaContractToContract(contract) : null;
}

export async function createContract(values: ContractInput) {
  const { processedRest, clientId, userId } = processContractValues(
    transformContractData(values),
  );

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
  return contracts.map(convertPrismaContractToContract);
}

export async function updateContract(id: string, values: ContractInput) {
  const { processedRest, clientId, userId } = processContractValues(
    transformContractData(values),
  );

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

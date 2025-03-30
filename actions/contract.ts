"use server";

import { Prisma , Contract as PrismaContract } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { StrictOmit } from "ts-essentials";

import {
  createContract,
  updateContract,
  deleteContract,
  searchContracts,
  getContractsByUserId,
  getContractById,
  getContractsByClientId,
} from "@/data/contract";
import { Serialize } from "@/lib/utils";
import { Client } from "@/types/client";
import { Contract, ContractInput } from "@/types/contract";

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
    middleRate: values.middleRate ? new Prisma.Decimal(values.middleRate) : null,
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
  contract: PrismaContract
): Contract => {
  return Serialize(contract);
};

export const createContractAction = async (
  values: ContractInput
): Promise<void> => {
  const contractData = transformContractData(values);
  await createContract(contractData);
  revalidatePath(`/client/${values.clientId}`);
};

export const updateContractAction = async (
  id: string,
  values: ContractInput
): Promise<void> => {
  const contractData = transformContractData(values);
  await updateContract(id, contractData);
  revalidatePath(`/client/${values.clientId}`);
};

export const deleteContractAction = async (id: string): Promise<void> => {
  await deleteContract(id);
  revalidatePath(`/client/${id}`);
};

export const searchContractsAction = async (
  userId: string,
  searchQuery: string
): Promise<Contract[]> => {
  try {
    const contracts = await searchContracts(userId, searchQuery);
    return contracts
      ? contracts.map(convertPrismaContractToContract)
      : ([] as Contract[]);
  } catch (error) {
    console.error("Error searching contracts:", error);
    throw new Error("Failed to search contracts");
  }
};

export const getContractsByUserIdAction = async (
  userId: string
): Promise<Contract[]> => {
  try {
    const contracts = await getContractsByUserId(userId);
    return contracts
      ? contracts.map(convertPrismaContractToContract)
      : ([] as Contract[]);
  } catch (error) {
    console.error("Error fetching contracts:", error);
    throw new Error("Failed to fetch contracts");
  }
};

export const getContractsByClientIdAction = async (
  clientId: string
): Promise<Contract[]> => {
  try {
    const contracts = await getContractsByClientId(clientId);
    return contracts
      ? contracts.map(convertPrismaContractToContract)
      : ([] as Contract[]);
  } catch (error) {
    console.error("Error fetching contracts:", error);
    throw new Error("Failed to fetch contracts");
  }
};

export const getContractByIdAction = async (
  contractId: string
): Promise<(Contract & { client: Client }) | null> => {
  try {
    const contract = await getContractById(contractId);
    return contract
      ? {
          ...convertPrismaContractToContract(contract),
          client: {
            ...contract.client,
            defaultEmailTemplateId:
              contract.client.defaultEmailTemplateId ?? undefined,
          },
        }
      : null;
  } catch (error) {
    console.error("Error fetching contract:", error);
    throw new Error("Failed to fetch contract details");
  }
};

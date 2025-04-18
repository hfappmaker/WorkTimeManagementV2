"use server";

import { revalidatePath } from "next/cache";

import {
  createContract,
  updateContract,
  deleteContract,
  searchContracts,
  getContractsByUserId,
  getContractById,
  getContractsByClientId,
} from "@/features/contract/repositories/contract-repository";
import {
  ContractOutput,
  ContractInput,
} from "@/features/contract/types/contract";

export const createContractAction = async (
  values: ContractInput,
): Promise<void> => {
  await createContract(values);
  revalidatePath(`/client/${values.clientId}`);
};

export const updateContractAction = async (
  id: string,
  values: ContractInput,
): Promise<void> => {
  await updateContract(id, values);
  revalidatePath(`/client/${values.clientId}`);
};

export const deleteContractAction = async (id: string): Promise<void> => {
  await deleteContract(id);
  revalidatePath(`/client/${id}`);
};

export const searchContractsAction = async (
  userId: string,
  searchQuery: string,
): Promise<ContractOutput[]> => {
  try {
    const contracts = await searchContracts(userId, searchQuery);
    return contracts;
  } catch (error) {
    console.error("Error searching contracts:", error);
    throw new Error("Failed to search contracts");
  }
};

export const getContractsByUserIdAction = async (
  userId: string,
): Promise<ContractOutput[]> => {
  try {
    const contracts = await getContractsByUserId(userId);
    return contracts;
  } catch (error) {
    console.error("Error fetching contracts:", error);
    throw new Error("Failed to fetch contracts");
  }
};

export const getContractsByClientIdAction = async (
  clientId: string,
): Promise<ContractOutput[]> => {
  try {
    const contracts = await getContractsByClientId(clientId);
    return contracts;
  } catch (error) {
    console.error("Error fetching contracts:", error);
    throw new Error("Failed to fetch contracts");
  }
};

export const getContractByIdAction = async (
  contractId: string,
): Promise<ContractOutput | null> => {
  try {
    const contract = await getContractById(contractId);
    return contract;
  } catch (error) {
    console.error("Error fetching contract:", error);
    throw new Error("Failed to fetch contract details");
  }
};

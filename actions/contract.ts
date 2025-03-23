"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  createContract,
  updateContract,
  deleteContract,
  searchContracts,
  getContractsByUserId,
  getContractById,
  getContractsByClientId,
} from "@/data/contract";
import { Contract } from "@prisma/client";
export const createContractAction = async (
  values: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>
) => {
  await createContract(values);
  console.log("Contract created successfully");
  revalidatePath(`/client/${values.clientId}`);
};

export const updateContractAction = async (
  id: string,
  values: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>
) => {
  await updateContract(id, values);
  revalidatePath(`/client/${values.clientId}`);
};

export const deleteContractAction = async (id: string) => {
  await deleteContract(id);
  revalidatePath(`/client/${id}`);
};

export const searchContractsAction = async (
  userId: string,
  searchQuery: string
) => {
  try {
    const contracts = await searchContracts(userId, searchQuery);
    return contracts ? JSON.parse(JSON.stringify(contracts)) : [];
  } catch (error) {
    console.error("Error searching contracts:", error);
    throw new Error("Failed to search contracts");
  }
};

export const getContractsByUserIdAction = async (userId: string) => {
  try {
    const contracts = await getContractsByUserId(userId);
    return contracts ? JSON.parse(JSON.stringify(contracts)) : [];
  } catch (error) {
    console.error("Error fetching contracts:", error);
    throw new Error("Failed to fetch contracts");
  }
};

export const getContractsByClientIdAction = async (clientId: string) => {
  try {
    const contracts = await getContractsByClientId(clientId);
    return contracts ? JSON.parse(JSON.stringify(contracts)) : [];
  } catch (error) {
    console.error("Error fetching contracts:", error);
    throw new Error("Failed to fetch contracts");
  }
};

export const getContractByIdAction = async (contractId: string) => {
  try {
    const contract = await getContractById(contractId);
    return contract ? JSON.parse(JSON.stringify(contract)) : null;
  } catch (error) {
    console.error("Error fetching contract:", error);
    throw new Error("Failed to fetch contract details");
  }
}; 
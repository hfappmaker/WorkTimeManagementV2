import { Contract as PrismaContract } from "@prisma/client";
import { StrictOmit } from "ts-essentials";

import { SerializedType } from "@/lib/utils";

export type Contract = SerializedType<PrismaContract>;

export type ContractInput = StrictOmit<
  SerializedType<PrismaContract, false>,
  "id"
>;
export type ContractOutput = StrictOmit<PrismaContract, "id">;

import { Contract as PrismaContract } from "@prisma/client";
import { StrictOmit } from "ts-essentials";

import { SerializedType } from "@/utils/serialization/serialization-utils";

export type ContractOutput = SerializedType<PrismaContract>;

export type ContractInput = StrictOmit<
  SerializedType<PrismaContract, false>,
  "id"
>;

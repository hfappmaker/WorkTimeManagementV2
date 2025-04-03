import { Client as PrismaClient } from "@prisma/client";

import { SerializedType } from "@/utils/utils";

export type Client = SerializedType<PrismaClient>;

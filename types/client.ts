import { Client as PrismaClient } from "@prisma/client";

import { SerializedType } from "@/lib/utils";

export type Client = SerializedType<PrismaClient>;

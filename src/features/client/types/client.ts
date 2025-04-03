import { Client as PrismaClient } from "@prisma/client";

import { SerializedType } from "@/utils/serialization/serialization-utils";

export type Client = SerializedType<PrismaClient>;

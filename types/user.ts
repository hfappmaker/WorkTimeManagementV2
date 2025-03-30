import { User as PrismaUser } from "@prisma/client";

import { SerializedType } from "@/lib/utils";

export type User = SerializedType<PrismaUser>;

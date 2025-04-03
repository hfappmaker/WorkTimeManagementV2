import { User as PrismaUser } from "@prisma/client";

import { SerializedType } from "@/utils/utils";

export type User = SerializedType<PrismaUser>;

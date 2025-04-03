import { User as PrismaUser } from "@prisma/client";

import { SerializedType } from "@/utils/serialization/serialization-utils";

export type User = SerializedType<PrismaUser>;

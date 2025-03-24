import { Contract as PrismaContract } from "@prisma/client";
import { DecimalToNumber, NullableToUndefined } from "@/lib/utils";
export type Contract = NullableToUndefined<DecimalToNumber<PrismaContract>>;
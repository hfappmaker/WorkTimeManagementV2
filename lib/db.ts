import { currentUser } from "./auth";
import { baseDb } from "./db-instance";

declare global {
  var prisma: ExtendedPrismaClient | undefined;
}

const extendedDb = baseDb.$extends({
  query: {
    $allModels: {
      async create({ args, query, model }) {
        const user = await currentUser();
        if (args.data && 'userId' in args.data && (args.data as any).userId !== user?.id) {
          throw new Error(`userId in data does not match current user for model ${model}`);
        }
        const result = await query(args);
        if (model !== 'AuditLog') {  // skip logging AuditLog operations
          await baseDb.auditLog.create({
            data: {
              tableName: model,
              recordId: result.id || '',
              action: 'CREATE',
              changedFields: result, // You can compute diff as needed.
              createdAt: new Date(),
              userId: user?.id ?? null,
            },
          });
        }

        return result;
      },
      async update({ args, query, model }) {
        const user = await currentUser();
        const modelKey = model.charAt(0).toLowerCase() + model.slice(1);
        const previous = await (baseDb as any)[modelKey].findUnique({ where: args.where });
        if (previous && (previous as any).userId && (previous as any).userId !== user?.id) {
          throw new Error(`Unauthorized update attempt: current user does not match record's userId on ${model}`);
        }
        const result = await query(args);
        if (model !== 'AuditLog') {
          await baseDb.auditLog.create({
            data: {
              tableName: model,
              recordId: previous?.id || '',
              action: 'UPDATE',
              changedFields: result, // Compute changes if needed.
              createdAt: new Date(),
              userId: user?.id ?? null,
            },
          });
        }

        return result;
      },
      async delete({ args, query, model }) {
        const user = await currentUser();
        const modelKey = model.charAt(0).toLowerCase() + model.slice(1);
        const previous = await (baseDb as any)[modelKey].findUnique({ where: args.where });
        if (previous && (previous as any).userId && (previous as any).userId !== user?.id) {
          throw new Error(`Unauthorized delete attempt: current user does not match record's userId on ${model}`);
        }
        const result = await query(args);

        if (model !== 'AuditLog') {
          await baseDb.auditLog.create({
            data: {
              tableName: model,
              recordId: previous?.id || '',
              action: 'DELETE',
              changedFields: result,
              createdAt: new Date(),
              userId: user?.id ?? null,
            },
          });
        }

        return result;
      },
      async findUnique({ args, query, model }) {
        const result = await query(args);
        const user = await currentUser();
        if (result && (result as any).userId && (result as any).userId !== user?.id) {
          throw new Error(`Unauthorized access: current user does not match record's userId on ${model}`);
        }
        return result;
      },
      async findFirst({ args, query, model }) {
        const result = await query(args);
        const user = await currentUser();
        if (result && (result as any).userId && (result as any).userId !== user?.id) {
          throw new Error(`Unauthorized access: current user does not match record's userId on ${model}`);
        }
        return result;
      },
      async findMany({ args, query, model }) {
        if (!args.where || (typeof args.where === 'object' && !('userId' in args.where))) {
          throw new Error(`Missing userId filter condition in findMany query for ${model}`);
        }
        return await query(args);
      },
    },
  },
});

type ExtendedPrismaClient = typeof extendedDb;

const db = globalThis.prisma || extendedDb;

export { db };
if (process.env.NODE_ENV !== "production") globalThis.prisma = db;



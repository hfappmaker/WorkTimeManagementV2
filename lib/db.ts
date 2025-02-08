import { PrismaClient } from "@prisma/client";
import { currentUser } from "./auth";

declare global {
  var prisma: ExtendedPrismaClient | undefined;
}

const extendedDb = new PrismaClient().$extends({
  query: {
    $allModels: {
      async create({ args, query, model }) {
        const user = await currentUser();
        const result = await query(args);
        console.log("create_test", args, query, model, result, user);
        if (model !== 'AuditLog') {  // skip logging AuditLog operations
          await db.auditLog.create({
            data: {
              tableName: model,
              recordId: result.id || '',
              action: 'CREATE',
              changedFields: result, // You can compute diff as needed.
              createdAt: new Date(),
              userId: user?.id || '',
            },
          });
        }

        return result;
      },
      async update({ args, query, model }) {
        const user = await currentUser();
        const modelKey = model.charAt(0).toLowerCase() + model.slice(1);
        const previous = await (db as any)[modelKey].findUnique({ where: args.where });
        const result = await query(args);
        if (model !== 'AuditLog') {
          await db.auditLog.create({
            data: {
              tableName: model,
              recordId: previous?.id || '',
              action: 'UPDATE',
              changedFields: result, // Compute changes if needed.
              createdAt: new Date(),
              userId: user?.id || '',
            },
          });
        }
        return result;
      },
      async delete({ args, query, model }) {
        const user = await currentUser();
        const modelKey = model.charAt(0).toLowerCase() + model.slice(1);
        const previous = await (db as any)[modelKey].findUnique({ where: args.where });
        const result = await query(args);
        if (model !== 'AuditLog') {

          await db.auditLog.create({
            data: {
              tableName: model,
              recordId: previous?.id || '',
              action: 'DELETE',
              changedFields: result,
              createdAt: new Date(),
              userId: user?.id || '',
            },
          });
        }

        return result;
      },
    },
  },
});

type ExtendedPrismaClient = typeof extendedDb;

const db = globalThis.prisma || extendedDb;

export { db };
if (process.env.NODE_ENV !== "production") globalThis.prisma = db;



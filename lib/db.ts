/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { currentUser } from "./auth";
import { baseDb } from "./base-db";

declare global {
  // eslint-disable-next-line no-var
  var prisma: ExtendedPrismaClient | undefined;
}

const extendedDb = baseDb.$extends({
  query: {
    $allModels: {
      async create({ args, query, model }) {
        const user = await currentUser();
        const result = await query(args);
        if (model !== "AuditLog") {
          // skip logging AuditLog operations
          await baseDb.auditLog.create({
            data: {
              tableName: model,
              recordId: result.id ?? "",
              action: "CREATE",
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
        const previous = await (baseDb as any)[modelKey].findUnique({
          where: args.where,
        });
        const result = await query(args);
        if (model !== "AuditLog") {
          await baseDb.auditLog.create({
            data: {
              tableName: model,
              recordId: previous?.id ?? "",
              action: "UPDATE",
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
        const previous = await (baseDb as any)[modelKey].findUnique({
          where: args.where,
        });
        const result = await query(args);

        if (model !== "AuditLog") {
          await baseDb.auditLog.create({
            data: {
              tableName: model,
              recordId: previous?.id ?? "",
              action: "DELETE",
              changedFields: result,
              createdAt: new Date(),
              userId: user?.id ?? null,
            },
          });
        }

        return result;
      },
    },
  },
});

type ExtendedPrismaClient = typeof extendedDb;

const db = globalThis.prisma ?? extendedDb;

export { db };
if (process.env.NODE_ENV !== "production") globalThis.prisma = db;

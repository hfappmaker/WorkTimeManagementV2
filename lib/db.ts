import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}
const db = globalThis.prisma || new PrismaClient();

// db.$extends({
//   query: {
//     $allModels: {
//       async create({ args, query, model }) {
//         const result = await query(args);
//         if (model !== 'AuditLog') {  // skip logging AuditLog operations
//           await db.auditLog.create({
//             data: {
//               tableName: model,
//               recordId: result.id || '',
//               action: 'CREATE',
//               changedFields: result, // You can compute diff as needed.
//               createdAt: new Date(),
//               userId: null, // TODO: Retrieve current user ID from context.
//             },
//           });
//         }
//         return result;
//       },
//       async update({ args, query, model }) {
//         const modelKey = model.charAt(0).toLowerCase() + model.slice(1);
//         const previous = await (db as any)[modelKey].findUnique({ where: args.where });
//         const result = await query(args);
//         if (model !== 'AuditLog') {
//           await db.auditLog.create({
//             data: {
//               tableName: model,
//               recordId: previous?.id || '',
//               action: 'UPDATE',
//               changedFields: result, // Compute changes if needed.
//               createdAt: new Date(),
//               userId: null, // TODO: Retrieve current user ID from context.

//             },
//           });
//         }
//         return result;
//       },
//       async delete({ args, query, model }) {
//         const modelKey = model.charAt(0).toLowerCase() + model.slice(1);
//         const previous = await (db as any)[modelKey].findUnique({ where: args.where });
//         const result = await query(args);
//         if (model !== 'AuditLog') {
//           await db.auditLog.create({
//             data: {
//               tableName: model,
//               recordId: previous?.id || '',
//               action: 'DELETE',
//               changedFields: result,
//               createdAt: new Date(),
//               userId: null, // TODO: Retrieve current user ID from context.
//             },
//           });
//         }
//         return result;
//       },
//     },
//   },
// });

export { db };
if (process.env.NODE_ENV !== "production") globalThis.prisma = db;


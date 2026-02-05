import { prisma } from './prisma'

interface AuditLogData {
  userId?: string
  action: string
  entityType: string
  entityId: string
  oldValues?: any
  newValues?: any
  ipAddress?: string
  userAgent?: string
}

export async function createAuditLog(data: AuditLogData) {
  return prisma.auditLog.create({
    data: {
      userId: data.userId,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      oldValues: data.oldValues,
      newValues: data.newValues,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    },
  })
}

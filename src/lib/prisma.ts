import 'dotenv/config'
import path from 'path'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { PrismaClient } from '@/generated/prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function resolveDbUrl(): string {
  const raw = process.env.DATABASE_URL || 'file:./dev.db'
  if (raw.startsWith('file:./') || raw.startsWith('file:../')) {
    const relative = raw.replace('file:', '')
    const absolute = path.resolve(process.cwd(), relative)
    return `file:${absolute}`
  }
  return raw
}

function createPrisma() {
  const url = resolveDbUrl()
  const adapter = new PrismaLibSql({ url })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma || createPrisma()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

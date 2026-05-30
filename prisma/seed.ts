import 'dotenv/config'
import path from 'path'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { PrismaClient } from '../src/generated/prisma/client'

function resolveDbUrl(): string {
  const raw = process.env.DATABASE_URL || 'file:./dev.db'
  if (raw.startsWith('file:./') || raw.startsWith('file:../')) {
    const relative = raw.replace('file:', '')
    const absolute = path.resolve(process.cwd(), relative)
    return `file:${absolute}`
  }
  return raw
}

const url = resolveDbUrl()
const authToken = process.env.TURSO_AUTH_TOKEN
const adapter = new PrismaLibSql({ url, ...(authToken ? { authToken } : {}) })
const prisma = new PrismaClient({ adapter })

async function main() {
  const categories = [
    { name: 'Arriendo', defaultPctXime: 70, defaultPctDani: 30, level: 'couple', color: '#8B5CF6' },
    { name: 'Facturas Hogar', defaultPctXime: 70, defaultPctDani: 30, level: 'couple', color: '#3B82F6' },
    { name: 'Mercado General', defaultPctXime: 70, defaultPctDani: 30, level: 'couple', color: '#10B981' },
    { name: 'Comidas Afuera', defaultPctXime: 70, defaultPctDani: 30, level: 'couple', color: '#F59E0B' },
    { name: 'Transporte', defaultPctXime: 70, defaultPctDani: 30, level: 'couple', color: '#6366F1' },
    { name: 'Entretenimiento', defaultPctXime: 70, defaultPctDani: 30, level: 'couple', color: '#EC4899' },
    { name: 'Familia / Amigos', defaultPctXime: 70, defaultPctDani: 30, level: 'couple', color: '#14B8A6' },
    { name: 'Vacaciones / Viajes', defaultPctXime: 70, defaultPctDani: 30, level: 'couple', color: '#F97316' },
    { name: 'Mascotas', defaultPctXime: 70, defaultPctDani: 30, level: 'couple', color: '#84CC16' },
    { name: 'Cuidado Personal Xime', defaultPctXime: 100, defaultPctDani: 0, level: 'xime', color: '#F59E0B' },
    { name: 'Salud Xime', defaultPctXime: 100, defaultPctDani: 0, level: 'xime', color: '#EF4444' },
    { name: 'Trabajo / Educación Xime', defaultPctXime: 100, defaultPctDani: 0, level: 'xime', color: '#F59E0B' },
    { name: 'Cuidado Personal Dani', defaultPctXime: 0, defaultPctDani: 100, level: 'dani', color: '#3B82F6' },
    { name: 'Salud Dani', defaultPctXime: 0, defaultPctDani: 100, level: 'dani', color: '#EF4444' },
    { name: 'Trabajo / Educación Dani', defaultPctXime: 0, defaultPctDani: 100, level: 'dani', color: '#3B82F6' },
    { name: 'Otros', defaultPctXime: 70, defaultPctDani: 30, level: 'couple', color: '#6B7280' },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: cat,
      create: cat,
    })
  }

  console.log('✅ Seed completado: 16 categorías creadas.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

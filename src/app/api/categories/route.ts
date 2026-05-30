import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } })
  return NextResponse.json(categories)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, defaultPctXime, defaultPctDani, level, color } = body
  const category = await prisma.category.create({
    data: {
      name,
      defaultPctXime: Number(defaultPctXime),
      defaultPctDani: Number(defaultPctDani),
      level: level || 'couple',
      color: color || '#8B5CF6',
    },
  })
  return NextResponse.json(category, { status: 201 })
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { name, defaultPctXime, defaultPctDani, level, color } = body
  const category = await prisma.category.update({
    where: { id: Number(id) },
    data: {
      name,
      defaultPctXime: Number(defaultPctXime),
      defaultPctDani: Number(defaultPctDani),
      level,
      color,
    },
  })
  return NextResponse.json(category)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.category.delete({ where: { id: Number(id) } })
  return NextResponse.json({ success: true })
}

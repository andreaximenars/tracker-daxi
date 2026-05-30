import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const month = searchParams.get('month')
  const level = searchParams.get('level')

  const where: Record<string, unknown> = {}
  if (month) where.month = month
  if (level) where.level = level

  const budgets = await prisma.budget.findMany({
    where,
    include: { category: true },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(budgets)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { month, level, categoryId, amount } = body

  const catId = categoryId ? Number(categoryId) : null

  const existing = await prisma.budget.findFirst({
    where: { month, level, categoryId: catId },
  })

  let budget
  if (existing) {
    budget = await prisma.budget.update({
      where: { id: existing.id },
      data: { amount: Number(amount) },
      include: { category: true },
    })
  } else {
    budget = await prisma.budget.create({
      data: {
        month,
        level,
        categoryId: catId,
        amount: Number(amount),
      },
      include: { category: true },
    })
  }
  return NextResponse.json(budget)
}

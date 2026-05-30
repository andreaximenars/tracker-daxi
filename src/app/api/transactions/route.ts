import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const month = searchParams.get('month')
  const paidBy = searchParams.get('paidBy')
  const categoryId = searchParams.get('categoryId')
  const status = searchParams.get('status')
  const monthField = searchParams.get('monthField') || 'caused' // 'caused' | 'payment'

  const where: Record<string, unknown> = {}
  if (month) {
    where[monthField === 'payment' ? 'paymentMonth' : 'causedMonth'] = month
  }
  if (paidBy) where.paidBy = paidBy
  if (categoryId) where.categoryId = Number(categoryId)
  if (status) where.status = status

  const transactions = await prisma.transaction.findMany({
    where,
    include: { category: true },
    orderBy: [{ causedDate: 'desc' }, { createdAt: 'desc' }],
  })
  return NextResponse.json(transactions)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    description,
    categoryId,
    amount,
    paidBy,
    causedDate,
    paymentDate,
    causedMonth,
    paymentMonth,
    status,
    percentXime,
    percentDani,
    notes,
  } = body

  const transaction = await prisma.transaction.create({
    data: {
      description,
      categoryId: Number(categoryId),
      amount: Number(amount),
      paidBy,
      causedDate,
      paymentDate: paymentDate || null,
      causedMonth,
      paymentMonth: paymentMonth || null,
      status: status || 'Ya',
      percentXime: Number(percentXime),
      percentDani: Number(percentDani),
      notes: notes || null,
    },
    include: { category: true },
  })
  return NextResponse.json(transaction, { status: 201 })
}

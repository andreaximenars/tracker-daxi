import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const transaction = await prisma.transaction.findUnique({
    where: { id: Number(id) },
    include: { category: true },
  })
  if (!transaction) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(transaction)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
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

  const transaction = await prisma.transaction.update({
    where: { id: Number(id) },
    data: {
      description,
      categoryId: Number(categoryId),
      amount: Number(amount),
      paidBy,
      causedDate,
      paymentDate: paymentDate || null,
      causedMonth,
      paymentMonth: paymentMonth || null,
      status,
      percentXime: Number(percentXime),
      percentDani: Number(percentDani),
      notes: notes || null,
    },
    include: { category: true },
  })
  return NextResponse.json(transaction)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.transaction.delete({ where: { id: Number(id) } })
  return NextResponse.json({ success: true })
}

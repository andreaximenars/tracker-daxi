import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const month = searchParams.get('month')
  const monthField = searchParams.get('monthField') || 'caused'

  const where: Record<string, unknown> = {}
  if (month) {
    where[monthField === 'payment' ? 'paymentMonth' : 'causedMonth'] = month
  }

  const transactions = await prisma.transaction.findMany({
    where,
    include: { category: true },
  })

  let ximePaid = 0
  let daniPaid = 0
  let ximeCorrespondsToXime = 0
  let ximeCorrespondsToDani = 0
  let daniCorrespondsToXime = 0
  let daniCorrespondsToDani = 0

  for (const t of transactions) {
    const amtXime = t.amount * (t.percentXime / 100)
    const amtDani = t.amount * (t.percentDani / 100)

    if (t.paidBy === 'Xime') {
      ximePaid += t.amount
      ximeCorrespondsToXime += amtXime
      ximeCorrespondsToDani += amtDani
    } else {
      daniPaid += t.amount
      daniCorrespondsToXime += amtXime
      daniCorrespondsToDani += amtDani
    }
  }

  // Cruce Xime = (paid for Dani) - (Dani paid for Xime)
  const cruceXime = ximeCorrespondsToDani - daniCorrespondsToXime
  // Cruce Dani = (paid for Xime) - (Xime paid for Dani)
  const cruceDani = daniCorrespondsToXime - ximeCorrespondsToDani

  // Net: positive → Xime is owed by Dani, negative → Dani is owed by Xime
  const netBalance = cruceXime // same as -cruceDani

  const totalPaid = ximePaid + daniPaid
  const totalXime = ximeCorrespondsToXime + daniCorrespondsToXime
  const totalDani = ximeCorrespondsToDani + daniCorrespondsToDani

  return NextResponse.json({
    transactions: transactions.length,
    totalPaid,
    xime: {
      paid: ximePaid,
      correspondsToXime: ximeCorrespondsToXime,
      correspondsToDani: ximeCorrespondsToDani,
      cruce: cruceXime,
    },
    dani: {
      paid: daniPaid,
      correspondsToXime: daniCorrespondsToXime,
      correspondsToDani: daniCorrespondsToDani,
      cruce: cruceDani,
    },
    totals: {
      xime: totalXime,
      dani: totalDani,
      paid: totalPaid,
    },
    // Who owes whom and how much
    debtor: netBalance > 0 ? 'Dani' : 'Xime',
    creditor: netBalance > 0 ? 'Xime' : 'Dani',
    amount: Math.abs(netBalance),
    netBalance,
  })
}

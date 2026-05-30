import { prisma } from '@/lib/prisma'
import TransactionForm from '@/components/TransactionForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditTransactionPage({ params }: Props) {
  const { id } = await params
  const [transaction, categories] = await Promise.all([
    prisma.transaction.findUnique({
      where: { id: Number(id) },
      include: { category: true },
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ])

  if (!transaction) notFound()

  return (
    <div className="pb-20 md:pb-0">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/transactions" className="text-slate-400 hover:text-slate-600">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Editar transacción</h1>
          <p className="text-slate-500 text-sm">{transaction.description}</p>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <TransactionForm
          categories={categories}
          transaction={{
            ...transaction,
            paymentDate: transaction.paymentDate ?? null,
            paymentMonth: transaction.paymentMonth ?? null,
            notes: transaction.notes ?? null,
          }}
        />
      </div>
    </div>
  )
}

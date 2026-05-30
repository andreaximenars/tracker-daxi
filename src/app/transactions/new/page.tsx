import { prisma } from '@/lib/prisma'
import TransactionForm from '@/components/TransactionForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function NewTransactionPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } })

  return (
    <div className="pb-20 md:pb-0">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/transactions" className="text-slate-400 hover:text-slate-600">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Nueva transacción</h1>
          <p className="text-slate-500 text-sm">Registra un nuevo gasto</p>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <TransactionForm categories={categories} />
      </div>
    </div>
  )
}

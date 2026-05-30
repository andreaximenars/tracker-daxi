import { prisma } from '@/lib/prisma'
import { formatMXN, getCurrentMonth, getMonthLabel, getMonthOptions } from '@/lib/utils'
import Link from 'next/link'
import DeleteButton from '@/components/DeleteButton'
import MonthNav from '@/components/MonthNav'
import { PlusCircle } from 'lucide-react'

interface Props {
  searchParams: Promise<{
    month?: string
    paidBy?: string
    categoryId?: string
    status?: string
  }>
}

export default async function TransactionsPage({ searchParams }: Props) {
  const sp = await searchParams
  const month = sp.month || getCurrentMonth()
  const paidBy = sp.paidBy || ''
  const categoryId = sp.categoryId ? Number(sp.categoryId) : undefined
  const status = sp.status || ''

  const where: Record<string, unknown> = { causedMonth: month }
  if (paidBy) where.paidBy = paidBy
  if (categoryId) where.categoryId = categoryId
  if (status) where.status = status

  const [transactions, categories] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: { category: true },
      orderBy: [{ causedDate: 'desc' }, { createdAt: 'desc' }],
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ])

  const totalAmount = transactions.reduce((s, t) => s + t.amount, 0)
  const totalXime = transactions.reduce((s, t) => s + t.amount * t.percentXime / 100, 0)
  const totalDani = transactions.reduce((s, t) => s + t.amount * t.percentDani / 100, 0)

  const monthOptions = getMonthOptions(24)

  return (
    <div className="space-y-5 pb-20 md:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Transacciones</h1>
          <p className="text-slate-500 text-sm capitalize">{getMonthLabel(month)}</p>
        </div>
        <div className="flex items-center gap-2">
          <MonthNav month={month} options={monthOptions} />
          <Link
            href="/transactions/new"
            className="flex items-center gap-1.5 bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-violet-700"
          >
            <PlusCircle size={16} />
            Nueva
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-white rounded-xl border border-slate-200 px-4 py-3">
        <form method="GET" className="flex flex-wrap gap-3 w-full">
          <input type="hidden" name="month" value={month} />
          <select
            name="paidBy"
            defaultValue={paidBy}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white"
          >
            <option value="">Todos</option>
            <option value="Xime">Xime pagó</option>
            <option value="Dani">Dani pagó</option>
          </select>
          <select
            name="categoryId"
            defaultValue={categoryId?.toString() || ''}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white"
          >
            <option value="">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            name="status"
            defaultValue={status}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white"
          >
            <option value="">Todos los estados</option>
            <option value="Ya">Ya pagado</option>
            <option value="Pendiente">Pendiente</option>
          </select>
          <button
            type="submit"
            className="text-sm bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700"
          >
            Filtrar
          </button>
          <Link
            href={`/transactions?month=${month}`}
            className="text-sm text-slate-500 hover:text-slate-700 px-2 py-2"
          >
            Limpiar
          </Link>
        </form>
      </div>

      {/* Table */}
      {transactions.length === 0 ? (
        <div className="text-center py-16 text-slate-400 bg-white rounded-xl border border-slate-200">
          <p className="text-lg">No hay transacciones para este período.</p>
          <Link
            href="/transactions/new"
            className="mt-4 inline-block bg-violet-600 text-white px-5 py-2.5 rounded-lg hover:bg-violet-700 font-medium text-sm"
          >
            + Agregar la primera
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-medium text-xs uppercase tracking-wide">
                  <th className="text-left px-4 py-3">Fecha</th>
                  <th className="text-left px-4 py-3">Descripción</th>
                  <th className="text-left px-4 py-3">Categoría</th>
                  <th className="px-4 py-3 text-right">Monto</th>
                  <th className="px-4 py-3">Pagó</th>
                  <th className="px-4 py-3 bg-amber-50 text-amber-600">%X / $X</th>
                  <th className="px-4 py-3 bg-blue-50 text-blue-600">%D / $D</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{t.causedDate}</td>
                    <td className="px-4 py-3 font-medium max-w-xs">
                      <div>{t.description}</div>
                      {t.notes && (
                        <div className="text-xs text-slate-400 truncate max-w-[200px]">{t.notes}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white whitespace-nowrap"
                        style={{ backgroundColor: t.category.color }}
                      >
                        {t.category.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">${formatMXN(t.amount)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                        t.paidBy === 'Xime' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {t.paidBy}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right bg-amber-50/30">
                      <span className="text-amber-600 font-medium">{t.percentXime}%</span>
                      <span className="text-amber-800 font-semibold ml-2">
                        ${formatMXN(t.amount * t.percentXime / 100)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right bg-blue-50/30">
                      <span className="text-blue-600 font-medium">{t.percentDani}%</span>
                      <span className="text-blue-800 font-semibold ml-2">
                        ${formatMXN(t.amount * t.percentDani / 100)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        t.status === 'Ya'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/transactions/${t.id}`}
                          className="text-xs text-violet-600 hover:text-violet-800 font-medium"
                        >
                          Editar
                        </Link>
                        <DeleteButton id={t.id} type="transaction" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50 font-semibold text-sm">
                  <td colSpan={3} className="px-4 py-3 text-slate-600">
                    TOTAL ({transactions.length} transacciones)
                  </td>
                  <td className="px-4 py-3 text-right">${formatMXN(totalAmount)}</td>
                  <td></td>
                  <td className="px-4 py-3 text-right bg-amber-50 text-amber-800">
                    ${formatMXN(totalXime)}
                  </td>
                  <td className="px-4 py-3 text-right bg-blue-50 text-blue-800">
                    ${formatMXN(totalDani)}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

import { prisma } from '@/lib/prisma'
import { formatMXN, getMonthLabel, getMonthOptions, getCurrentMonth } from '@/lib/utils'
import Link from 'next/link'
import MonthNav from '@/components/MonthNav'
import { TrendingDown, TrendingUp } from 'lucide-react'

interface Props {
  searchParams: Promise<{ month?: string; monthField?: string }>
}

export default async function SummaryPage({ searchParams }: Props) {
  const sp = await searchParams
  const month = sp.month || getCurrentMonth()
  const monthField = sp.monthField || 'caused'

  const where: Record<string, unknown> = {
    [monthField === 'payment' ? 'paymentMonth' : 'causedMonth']: month,
  }

  const transactions = await prisma.transaction.findMany({
    where,
    include: { category: true },
    orderBy: { causedDate: 'desc' },
  })

  let ximePaid = 0, daniPaid = 0
  let ximeForXime = 0, ximeForDani = 0
  let daniForXime = 0, daniForDani = 0

  for (const t of transactions) {
    const ax = t.amount * (t.percentXime / 100)
    const ad = t.amount * (t.percentDani / 100)
    if (t.paidBy === 'Xime') {
      ximePaid += t.amount; ximeForXime += ax; ximeForDani += ad
    } else {
      daniPaid += t.amount; daniForXime += ax; daniForDani += ad
    }
  }

  const cruceXime = ximeForDani - daniForXime
  const cruceDani = daniForXime - ximeForDani
  const owes = Math.abs(cruceXime)

  const monthOptions = getMonthOptions(24)

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Resumen Mensual</h1>
          <p className="text-slate-500 text-sm capitalize">{getMonthLabel(month)}</p>
        </div>
        <div className="flex items-center gap-3">
          <MonthNav month={month} options={monthOptions} />
          <div className="flex gap-1 bg-white border border-slate-200 rounded-lg p-1 text-sm">
            <a
              href={`/summary?month=${month}&monthField=caused`}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${monthField === 'caused' ? 'bg-violet-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              Causado
            </a>
            <a
              href={`/summary?month=${month}&monthField=payment`}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${monthField === 'payment' ? 'bg-violet-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              Pago
            </a>
          </div>
        </div>
      </div>

      {/* Balance card */}
      <div className={`rounded-2xl p-6 text-white shadow-lg ${
        owes === 0 ? 'bg-gradient-to-br from-slate-500 to-slate-700' :
        cruceXime > 0 ? 'bg-gradient-to-br from-blue-500 to-blue-700' :
        'bg-gradient-to-br from-amber-500 to-orange-600'
      }`}>
        {owes === 0 ? (
          <div className="text-center">
            <div className="text-lg font-semibold opacity-90">¡Están a mano!</div>
            <div className="text-4xl font-bold mt-1">$0 MX</div>
          </div>
        ) : (
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-lg font-semibold opacity-90">
              {cruceXime > 0 ? <TrendingDown size={20} /> : <TrendingUp size={20} />}
              {cruceXime > 0 ? 'Dani debe a Xime' : 'Xime debe a Dani'}
            </div>
            <div className="text-5xl font-bold mt-1">${formatMXN(owes)} MX</div>
            <div className="text-sm opacity-80 mt-2">{transactions.length} transacciones</div>
          </div>
        )}
      </div>

      {/* Cruce table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-700">Tabla de Cruce</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Positivo = saldo a favor · Negativo = debe a la otra persona
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left px-5 py-3 text-slate-500 font-medium">Quien pagó</th>
                <th className="px-4 py-3 text-amber-600 font-medium bg-amber-50">
                  Corresponde Xime
                </th>
                <th className="px-4 py-3 text-blue-600 font-medium bg-blue-50">
                  Corresponde Dani
                </th>
                <th className="px-4 py-3 text-slate-600 font-medium">Total pagado</th>
                <th className="px-4 py-3 text-slate-600 font-medium">Cruce</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-slate-100">
                <td className="px-5 py-3 font-medium text-amber-700">Xime</td>
                <td className="px-4 py-3 text-right bg-amber-50/50 text-amber-800">
                  ${formatMXN(ximeForXime)}
                </td>
                <td className="px-4 py-3 text-right bg-blue-50/50 text-blue-800">
                  ${formatMXN(ximeForDani)}
                </td>
                <td className="px-4 py-3 text-right font-semibold">${formatMXN(ximePaid)}</td>
                <td className={`px-4 py-3 text-right font-semibold ${
                  cruceXime > 0 ? 'text-green-600' : cruceXime < 0 ? 'text-red-500' : 'text-slate-500'
                }`}>
                  {cruceXime >= 0 ? '+' : ''}{formatMXN(cruceXime)}
                </td>
              </tr>
              <tr className="border-t border-slate-100">
                <td className="px-5 py-3 font-medium text-blue-700">Dani</td>
                <td className="px-4 py-3 text-right bg-amber-50/50 text-amber-800">
                  ${formatMXN(daniForXime)}
                </td>
                <td className="px-4 py-3 text-right bg-blue-50/50 text-blue-800">
                  ${formatMXN(daniForDani)}
                </td>
                <td className="px-4 py-3 text-right font-semibold">${formatMXN(daniPaid)}</td>
                <td className={`px-4 py-3 text-right font-semibold ${
                  cruceDani > 0 ? 'text-green-600' : cruceDani < 0 ? 'text-red-500' : 'text-slate-500'
                }`}>
                  {cruceDani >= 0 ? '+' : ''}{formatMXN(cruceDani)}
                </td>
              </tr>
              <tr className="border-t-2 border-slate-200 bg-slate-50 font-semibold">
                <td className="px-5 py-3 text-slate-700">Totales</td>
                <td className="px-4 py-3 text-right bg-amber-50 text-amber-800">
                  ${formatMXN(ximeForXime + daniForXime)}
                </td>
                <td className="px-4 py-3 text-right bg-blue-50 text-blue-800">
                  ${formatMXN(ximeForDani + daniForDani)}
                </td>
                <td className="px-4 py-3 text-right">${formatMXN(ximePaid + daniPaid)}</td>
                <td className="px-4 py-3"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Individual detail */}
      {transactions.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-700">Detalle del mes</h2>
            <Link
              href={`/transactions?month=${month}`}
              className="text-sm text-violet-600 hover:text-violet-800 font-medium"
            >
              Ver todas →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-medium">
                  <th className="text-left px-5 py-3">Fecha</th>
                  <th className="text-left px-4 py-3">Descripción</th>
                  <th className="text-left px-4 py-3">Categoría</th>
                  <th className="px-4 py-3 text-right">Monto</th>
                  <th className="px-4 py-3">Pagó</th>
                  <th className="px-4 py-3 text-right bg-amber-50">$ Xime</th>
                  <th className="px-4 py-3 text-right bg-blue-50">$ Dani</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                    <td className="px-5 py-2.5 text-slate-500 whitespace-nowrap">{t.causedDate}</td>
                    <td className="px-4 py-2.5 font-medium max-w-xs">
                      <Link href={`/transactions/${t.id}`} className="hover:text-violet-600">
                        {t.description}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: t.category.color }}
                      >
                        {t.category.name}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium">${formatMXN(t.amount)}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        t.paidBy === 'Xime'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {t.paidBy}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right bg-amber-50/30 text-amber-800">
                      ${formatMXN(t.amount * t.percentXime / 100)}
                    </td>
                    <td className="px-4 py-2.5 text-right bg-blue-50/30 text-blue-800">
                      ${formatMXN(t.amount * t.percentDani / 100)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50 font-semibold">
                  <td colSpan={3} className="px-5 py-3 text-slate-600">TOTAL</td>
                  <td className="px-4 py-3 text-right">${formatMXN(ximePaid + daniPaid)}</td>
                  <td></td>
                  <td className="px-4 py-3 text-right bg-amber-50 text-amber-800">
                    ${formatMXN(ximeForXime + daniForXime)}
                  </td>
                  <td className="px-4 py-3 text-right bg-blue-50 text-blue-800">
                    ${formatMXN(ximeForDani + daniForDani)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {transactions.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <p className="text-lg">No hay transacciones este mes.</p>
          <Link
            href="/transactions/new"
            className="mt-4 inline-block bg-violet-600 text-white px-5 py-2.5 rounded-lg hover:bg-violet-700 font-medium"
          >
            + Agregar transacción
          </Link>
        </div>
      )}
    </div>
  )
}

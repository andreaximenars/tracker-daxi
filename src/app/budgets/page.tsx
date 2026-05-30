import { prisma } from '@/lib/prisma'
import { getCurrentMonth, getMonthLabel, getMonthOptions } from '@/lib/utils'
import BudgetManager from '@/components/BudgetManager'
import MonthNav from '@/components/MonthNav'

interface Props {
  searchParams: Promise<{ month?: string; level?: string }>
}

export default async function BudgetsPage({ searchParams }: Props) {
  const sp = await searchParams
  const month = sp.month || getCurrentMonth()
  const level = sp.level || 'couple'

  const [budgets, categories, transactions] = await Promise.all([
    prisma.budget.findMany({
      where: { month },
      include: { category: true },
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.transaction.findMany({
      where: { causedMonth: month },
      include: { category: true },
    }),
  ])

  // Compute actuals by category and level
  const actuals: Record<string, number> = {}
  for (const t of transactions) {
    const key = `${t.categoryId}`
    if (!actuals[key]) actuals[key] = 0
    // For couple: full amount; for xime: xime portion; for dani: dani portion
    if (level === 'couple') actuals[key] += t.amount
    else if (level === 'xime') actuals[key] += t.amount * t.percentXime / 100
    else actuals[key] += t.amount * t.percentDani / 100
  }

  const monthOptions = getMonthOptions(24)

  return (
    <div className="space-y-5 pb-20 md:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Presupuestos</h1>
          <p className="text-slate-500 text-sm capitalize">{getMonthLabel(month)}</p>
        </div>
        <MonthNav month={month} options={monthOptions} />
      </div>

      {/* Level tabs */}
      <div className="flex gap-2 bg-white rounded-xl border border-slate-200 p-1.5 w-fit">
        {[
          { value: 'couple', label: '💑 Pareja' },
          { value: 'xime', label: '👩 Xime' },
          { value: 'dani', label: '👨 Dani' },
        ].map(({ value, label }) => {
          const active = level === value
          return (
            <a
              key={value}
              href={`/budgets?month=${month}&level=${value}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                active ? 'bg-violet-600 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {label}
            </a>
          )
        })}
      </div>

      <BudgetManager
        budgets={budgets.map(b => ({ ...b, categoryId: b.categoryId ?? undefined }))}
        categories={categories}
        actuals={actuals}
        month={month}
        level={level}
      />
    </div>
  )
}

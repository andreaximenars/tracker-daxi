'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatMXN } from '@/lib/utils'
import { Plus, Pencil, Check, X } from 'lucide-react'

interface Category {
  id: number
  name: string
  color: string
}

interface Budget {
  id: number
  month: string
  level: string
  categoryId?: number
  amount: number
  category?: Category | null
}

interface Props {
  budgets: Budget[]
  categories: Category[]
  actuals: Record<string, number>
  month: string
  level: string
}

export default function BudgetManager({ budgets: initial, categories, actuals, month, level }: Props) {
  const router = useRouter()
  const [budgets, setBudgets] = useState(initial)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [newCategoryId, setNewCategoryId] = useState('')
  const [newAmount, setNewAmount] = useState('')
  const [editAmount, setEditAmount] = useState('')
  const [saving, setSaving] = useState(false)

  async function saveNew() {
    if (!newAmount) return
    setSaving(true)
    const res = await fetch('/api/budgets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        month,
        level,
        categoryId: newCategoryId ? Number(newCategoryId) : null,
        amount: Number(newAmount),
      }),
    })
    const created = await res.json()
    // Check if it's an update (upsert)
    const existing = budgets.find((b) => b.id === created.id)
    if (existing) {
      setBudgets(budgets.map((b) => (b.id === created.id ? created : b)))
    } else {
      setBudgets([...budgets, created])
    }
    setNewCategoryId('')
    setNewAmount('')
    setShowNew(false)
    setSaving(false)
  }

  async function saveEdit(id: number) {
    setSaving(true)
    const budget = budgets.find((b) => b.id === id)!
    const res = await fetch('/api/budgets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        month,
        level,
        categoryId: budget.categoryId ?? null,
        amount: Number(editAmount),
      }),
    })
    const updated = await res.json()
    setBudgets(budgets.map((b) => (b.id === updated.id ? updated : b)))
    setEditingId(null)
    setSaving(false)
  }

  async function deleteBudget(id: number) {
    await fetch(`/api/budgets/${id}`, { method: 'DELETE' })
    setBudgets(budgets.filter((b) => b.id !== id))
  }

  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0)
  const totalActual = Object.values(actuals).reduce((s, v) => s + v, 0)

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      {budgets.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-slate-500 text-sm">Presupuesto total</span>
              <div className="text-2xl font-bold text-slate-800">${formatMXN(totalBudget)}</div>
            </div>
            <div className="text-right">
              <span className="text-slate-500 text-sm">Gastado</span>
              <div className={`text-2xl font-bold ${totalActual > totalBudget ? 'text-red-600' : 'text-green-600'}`}>
                ${formatMXN(totalActual)}
              </div>
            </div>
          </div>
          <div className="bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${totalActual > totalBudget ? 'bg-red-500' : 'bg-green-500'}`}
              style={{ width: `${Math.min(100, (totalActual / totalBudget) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>{totalBudget > 0 ? ((totalActual / totalBudget) * 100).toFixed(0) : 0}% usado</span>
            <span>${formatMXN(Math.max(0, totalBudget - totalActual))} disponible</span>
          </div>
        </div>
      )}

      {/* Budget rows */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-700">Por categoría</h2>
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-1.5 bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700"
          >
            <Plus size={16} /> Agregar
          </button>
        </div>

        {budgets.length === 0 && !showNew && (
          <div className="py-10 text-center text-slate-400 text-sm">
            No hay presupuestos para este mes y nivel.
            <br />
            Haz clic en &quot;Agregar&quot; para crear uno.
          </div>
        )}

        {(budgets.length > 0 || showNew) && (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                <th className="text-left px-5 py-3">Categoría</th>
                <th className="px-4 py-3 text-right">Presupuesto</th>
                <th className="px-4 py-3 text-right">Gastado</th>
                <th className="px-4 py-3">Progreso</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {budgets.map((b) => {
                const actual = b.categoryId ? (actuals[b.categoryId.toString()] || 0) : 0
                const pct = b.amount > 0 ? (actual / b.amount) * 100 : 0
                const over = actual > b.amount
                return (
                  <tr key={b.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                    <td className="px-5 py-3">
                      {b.category ? (
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: b.category.color }} />
                          <span className="font-medium">{b.category.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">General</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {editingId === b.id ? (
                        <input
                          type="number"
                          className="w-28 border border-slate-200 rounded-lg px-2 py-1 text-sm text-right"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                        />
                      ) : (
                        `$${formatMXN(b.amount)}`
                      )}
                    </td>
                    <td className={`px-4 py-3 text-right font-medium ${over ? 'text-red-600' : 'text-green-600'}`}>
                      ${formatMXN(actual)}
                    </td>
                    <td className="px-4 py-3 min-w-[120px]">
                      <div className="bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${over ? 'bg-red-400' : pct > 80 ? 'bg-amber-400' : 'bg-green-400'}`}
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 text-center">{pct.toFixed(0)}%</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {editingId === b.id ? (
                          <>
                            <button onClick={() => saveEdit(b.id)} disabled={saving} className="text-green-600 hover:text-green-800">
                              <Check size={16} />
                            </button>
                            <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-600">
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => { setEditingId(b.id); setEditAmount(b.amount.toString()) }}
                              className="text-slate-400 hover:text-violet-600"
                            >
                              <Pencil size={14} />
                            </button>
                            <button onClick={() => deleteBudget(b.id)} className="text-slate-400 hover:text-red-500">
                              <X size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}

              {showNew && (
                <tr className="border-t border-violet-100 bg-violet-50/30">
                  <td className="px-5 py-3">
                    <select
                      className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white w-full"
                      value={newCategoryId}
                      onChange={(e) => setNewCategoryId(e.target.value)}
                    >
                      <option value="">General (sin categoría)</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      className="w-32 border border-slate-200 rounded-lg px-3 py-2 text-sm text-right ml-auto block"
                      placeholder="Monto"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                    />
                  </td>
                  <td colSpan={2}></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={saveNew}
                        disabled={saving || !newAmount}
                        className="text-green-600 hover:text-green-800 disabled:opacity-40"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => { setShowNew(false); setNewCategoryId(''); setNewAmount('') }}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

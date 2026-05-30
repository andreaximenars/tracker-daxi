'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { todayISO, dateToMonth } from '@/lib/utils'

interface Category {
  id: number
  name: string
  defaultPctXime: number
  defaultPctDani: number
  level: string
  color: string
}

interface Transaction {
  id: number
  description: string
  categoryId: number
  amount: number
  paidBy: string
  causedDate: string
  paymentDate: string | null
  causedMonth: string
  paymentMonth: string | null
  status: string
  percentXime: number
  percentDani: number
  notes: string | null
}

interface Props {
  categories: Category[]
  transaction?: Transaction
}

export default function TransactionForm({ categories, transaction }: Props) {
  const router = useRouter()
  const isEdit = !!transaction

  const today = todayISO()

  const [description, setDescription] = useState(transaction?.description || '')
  const [categoryId, setCategoryId] = useState(transaction?.categoryId?.toString() || '')
  const [amount, setAmount] = useState(transaction?.amount?.toString() || '')
  const [paidBy, setPaidBy] = useState(transaction?.paidBy || 'Xime')
  const [causedDate, setCausedDate] = useState(transaction?.causedDate || today)
  const [paymentDate, setPaymentDate] = useState(transaction?.paymentDate || '')
  const [status, setStatus] = useState(transaction?.status || 'Ya')
  const [percentXime, setPercentXime] = useState(transaction?.percentXime?.toString() || '70')
  const [percentDani, setPercentDani] = useState(transaction?.percentDani?.toString() || '30')
  const [notes, setNotes] = useState(transaction?.notes || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Auto-fill percentages when category changes
  useEffect(() => {
    if (!isEdit && categoryId) {
      const cat = categories.find((c) => c.id === Number(categoryId))
      if (cat) {
        setPercentXime(cat.defaultPctXime.toString())
        setPercentDani(cat.defaultPctDani.toString())
      }
    }
  }, [categoryId, categories, isEdit])

  function handlePercentXimeChange(val: string) {
    setPercentXime(val)
    const n = parseFloat(val)
    if (!isNaN(n)) setPercentDani((100 - n).toString())
  }

  function handlePercentDaniChange(val: string) {
    setPercentDani(val)
    const n = parseFloat(val)
    if (!isNaN(n)) setPercentXime((100 - n).toString())
  }

  const amountNum = parseFloat(amount) || 0
  const pctX = parseFloat(percentXime) || 0
  const pctD = parseFloat(percentDani) || 0
  const amtXime = amountNum * (pctX / 100)
  const amtDani = amountNum * (pctD / 100)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const body = {
      description,
      categoryId: Number(categoryId),
      amount: parseFloat(amount),
      paidBy,
      causedDate,
      paymentDate: paymentDate || null,
      causedMonth: dateToMonth(causedDate),
      paymentMonth: paymentDate ? dateToMonth(paymentDate) : null,
      status,
      percentXime: parseFloat(percentXime),
      percentDani: parseFloat(percentDani),
      notes: notes || null,
    }

    try {
      const url = isEdit ? `/api/transactions/${transaction!.id}` : '/api/transactions'
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('Error al guardar')
      router.push('/transactions')
      router.refresh()
    } catch (err) {
      setError('Error al guardar la transacción. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const fieldClass = 'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent'
  const labelClass = 'block text-sm font-medium text-slate-700 mb-1.5'

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Description */}
      <div>
        <label className={labelClass}>Descripción *</label>
        <input
          type="text"
          className={fieldClass}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="ej. Uber, Mercado, Arriendo..."
          required
        />
      </div>

      {/* Category + Amount in a row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Categoría *</label>
          <select
            className={fieldClass}
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
          >
            <option value="">Seleccionar...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Monto (MX) *</label>
          <input
            type="number"
            className={fieldClass}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
            required
          />
        </div>
      </div>

      {/* Who paid + Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>¿Quién pagó? *</label>
          <div className="flex gap-3">
            {['Xime', 'Dani'].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPaidBy(p)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border-2 transition-all ${
                  paidBy === p
                    ? p === 'Xime'
                      ? 'bg-amber-500 border-amber-500 text-white'
                      : 'bg-blue-500 border-blue-500 text-white'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className={labelClass}>Estado</label>
          <select className={fieldClass} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="Ya">Ya pagado</option>
            <option value="Pendiente">Pendiente</option>
          </select>
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Fecha causada *</label>
          <input
            type="date"
            className={fieldClass}
            value={causedDate}
            onChange={(e) => setCausedDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelClass}>
            Fecha de pago{' '}
            <span className="text-slate-400 font-normal">(si es diferente)</span>
          </label>
          <input
            type="date"
            className={fieldClass}
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
          />
        </div>
      </div>

      {/* Split percentages */}
      <div>
        <label className={labelClass}>División del gasto</label>
        <div className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-amber-700">Xime</span>
                <span className="text-sm text-amber-700">
                  {amtXime > 0 && `$${amtXime.toLocaleString('es-MX', { maximumFractionDigits: 0 })}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={percentXime}
                  onChange={(e) => handlePercentXimeChange(e.target.value)}
                  className="flex-1 accent-amber-500"
                />
                <input
                  type="number"
                  className="w-16 border border-slate-200 rounded-lg px-2 py-1.5 text-sm text-center bg-white"
                  value={percentXime}
                  onChange={(e) => handlePercentXimeChange(e.target.value)}
                  min="0"
                  max="100"
                />
                <span className="text-slate-500 text-sm">%</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-blue-700">Dani</span>
                <span className="text-sm text-blue-700">
                  {amtDani > 0 && `$${amtDani.toLocaleString('es-MX', { maximumFractionDigits: 0 })}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={percentDani}
                  onChange={(e) => handlePercentDaniChange(e.target.value)}
                  className="flex-1 accent-blue-500"
                />
                <input
                  type="number"
                  className="w-16 border border-slate-200 rounded-lg px-2 py-1.5 text-sm text-center bg-white"
                  value={percentDani}
                  onChange={(e) => handlePercentDaniChange(e.target.value)}
                  min="0"
                  max="100"
                />
                <span className="text-slate-500 text-sm">%</span>
              </div>
            </div>
          </div>
          {Math.abs(pctX + pctD - 100) > 0.01 && (
            <p className="text-xs text-red-500">
              Los porcentajes deben sumar 100% (actualmente {(pctX + pctD).toFixed(0)}%)
            </p>
          )}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className={labelClass}>Notas <span className="text-slate-400 font-normal">(opcional)</span></label>
        <textarea
          className={fieldClass}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Notas adicionales..."
        />
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-violet-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-violet-700 disabled:opacity-60 transition-colors"
        >
          {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Guardar transacción'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}

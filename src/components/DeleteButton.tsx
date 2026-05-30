'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

interface Props {
  id: number
  type: 'transaction' | 'category' | 'budget'
}

export default function DeleteButton({ id, type }: Props) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setLoading(true)
    await fetch(`/api/${type === 'transaction' ? 'transactions' : type === 'category' ? 'categories' : 'budgets'}/${id}`, {
      method: 'DELETE',
    })
    router.refresh()
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-xs text-red-600 hover:text-red-800 font-medium"
        >
          {loading ? '...' : 'Sí'}
        </button>
        <span className="text-slate-300">|</span>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs text-slate-500 hover:text-slate-700"
        >
          No
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-slate-400 hover:text-red-500 transition-colors"
      title="Eliminar"
    >
      <Trash2 size={14} />
    </button>
  )
}

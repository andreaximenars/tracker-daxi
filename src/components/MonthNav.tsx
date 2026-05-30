'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { getMonthLabel } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  month: string
  options: string[]
}

export default function MonthNav({ month, options }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentIdx = options.indexOf(month)

  function navigate(newMonth: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('month', newMonth)
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-1 py-1">
      <button
        onClick={() => currentIdx < options.length - 1 && navigate(options[currentIdx + 1])}
        disabled={currentIdx >= options.length - 1}
        className="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronLeft size={16} />
      </button>
      <select
        value={month}
        onChange={(e) => navigate(e.target.value)}
        className="text-sm font-medium bg-transparent border-none outline-none cursor-pointer px-1 capitalize"
      >
        {options.map((m) => (
          <option key={m} value={m}>
            {getMonthLabel(m)}
          </option>
        ))}
      </select>
      <button
        onClick={() => currentIdx > 0 && navigate(options[currentIdx - 1])}
        disabled={currentIdx <= 0}
        className="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}

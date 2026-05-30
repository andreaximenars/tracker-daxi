'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, List, PlusCircle, Tag, Wallet, TrendingUp } from 'lucide-react'

const links = [
  { href: '/', label: 'Resumen', icon: BarChart3 },
  { href: '/transactions', label: 'Transacciones', icon: List },
  { href: '/transactions/new', label: 'Nueva', icon: PlusCircle },
  { href: '/budgets', label: 'Presupuestos', icon: Wallet },
  { href: '/categories', label: 'Categorías', icon: Tag },
]

export default function Navigation() {
  const pathname = usePathname()
  return (
    <>
      {/* Desktop sidebar */}
      <header className="hidden md:flex items-center justify-between bg-white border-b border-slate-200 px-6 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <TrendingUp className="text-violet-600" size={22} />
          <span className="font-bold text-lg text-violet-700">Tracker Daxi</span>
        </div>
        <nav className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-violet-100 text-violet-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            )
          })}
        </nav>
      </header>

      {/* Mobile bottom nav */}
      <header className="md:hidden flex items-center justify-between bg-white border-b border-slate-200 px-4 py-2 shadow-sm">
        <div className="flex items-center gap-2">
          <TrendingUp className="text-violet-600" size={18} />
          <span className="font-bold text-violet-700">Tracker Daxi</span>
        </div>
      </header>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 flex items-center justify-around px-2 py-2">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                active ? 'text-violet-700' : 'text-slate-500'
              }`}
            >
              <Icon size={20} />
              {label === 'Transacciones' ? 'Txns' : label}
            </Link>
          )
        })}
      </nav>
    </>
  )
}

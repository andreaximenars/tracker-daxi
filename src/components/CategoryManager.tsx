'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Check, X } from 'lucide-react'
import DeleteButton from './DeleteButton'

interface Category {
  id: number
  name: string
  defaultPctXime: number
  defaultPctDani: number
  level: string
  color: string
}

const COLORS = [
  '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#EC4899', '#6366F1', '#14B8A6', '#F97316', '#84CC16',
  '#6B7280', '#0EA5E9',
]

const LEVEL_LABELS: Record<string, string> = {
  couple: '💑 Pareja',
  xime: '👩 Solo Xime',
  dani: '👩 Solo Dani',
}

export default function CategoryManager({ categories: initial }: { categories: Category[] }) {
  const router = useRouter()
  const [categories, setCategories] = useState(initial)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [saving, setSaving] = useState(false)

  const emptyForm = { name: '', defaultPctXime: 70, defaultPctDani: 30, level: 'couple', color: '#8B5CF6' }
  const [form, setForm] = useState<Omit<Category, 'id'>>(emptyForm)

  function handlePctXime(val: number) {
    setForm({ ...form, defaultPctXime: val, defaultPctDani: 100 - val })
  }

  async function saveNew() {
    if (!form.name.trim()) return
    setSaving(true)
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const created = await res.json()
    setCategories([...categories, created].sort((a, b) => a.name.localeCompare(b.name)))
    setForm(emptyForm)
    setShowNew(false)
    setSaving(false)
  }

  async function saveEdit(cat: Category) {
    setSaving(true)
    const res = await fetch(`/api/categories/${cat.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cat),
    })
    const updated = await res.json()
    setCategories(categories.map((c) => (c.id === updated.id ? updated : c)))
    setEditingId(null)
    setSaving(false)
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id)
    setForm({ ...cat })
    setShowNew(false)
  }

  const grouped = {
    couple: categories.filter((c) => c.level === 'couple'),
    xime: categories.filter((c) => c.level === 'xime'),
    dani: categories.filter((c) => c.level === 'dani'),
  }

  const fieldClass = 'border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500'

  function CategoryRow({ cat }: { cat: Category }) {
    const isEditing = editingId === cat.id
    const [local, setLocal] = useState({ ...cat })

    function handleLocalPctXime(val: number) {
      setLocal({ ...local, defaultPctXime: val, defaultPctDani: 100 - val })
    }

    return (
      <tr className="border-t border-slate-100 hover:bg-slate-50/50">
        <td className="px-4 py-3">
          {isEditing ? (
            <input
              className={fieldClass + ' w-full'}
              value={local.name}
              onChange={(e) => setLocal({ ...local, name: e.target.value })}
            />
          ) : (
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: cat.color }} />
              <span className="font-medium">{cat.name}</span>
            </div>
          )}
        </td>
        <td className="px-4 py-3">
          {isEditing ? (
            <select
              className={fieldClass}
              value={local.level}
              onChange={(e) => setLocal({ ...local, level: e.target.value })}
            >
              {Object.entries(LEVEL_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          ) : (
            <span className="text-sm text-slate-600">{LEVEL_LABELS[cat.level]}</span>
          )}
        </td>
        <td className="px-4 py-3">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <span className="text-amber-600 text-xs w-8">{local.defaultPctXime}%</span>
              <input
                type="range" min="0" max="100" value={local.defaultPctXime}
                onChange={(e) => handleLocalPctXime(Number(e.target.value))}
                className="w-24 accent-amber-500"
              />
              <span className="text-blue-600 text-xs w-8">{local.defaultPctDani}%</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs">
              <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">
                X {cat.defaultPctXime}%
              </span>
              <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">
                D {cat.defaultPctDani}%
              </span>
            </div>
          )}
        </td>
        <td className="px-4 py-3">
          {isEditing ? (
            <div className="flex flex-wrap items-center gap-1">
              {COLORS.map((c) => (
                <button
                  key={c} type="button"
                  onClick={() => setLocal({ ...local, color: c })}
                  className={`w-5 h-5 rounded-full border-2 ${local.color === c ? 'border-slate-800' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <input
                type="color"
                value={local.color}
                onChange={(e) => setLocal({ ...local, color: e.target.value })}
                className="w-5 h-5 rounded-full cursor-pointer border-0 p-0 bg-transparent"
                title="Color personalizado"
              />
            </div>
          ) : (
            <span className="w-5 h-5 rounded-full inline-block" style={{ backgroundColor: cat.color }} />
          )}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={() => saveEdit(local)}
                  disabled={saving}
                  className="text-green-600 hover:text-green-800"
                >
                  <Check size={16} />
                </button>
                <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-600">
                  <X size={16} />
                </button>
              </>
            ) : (
              <>
                <button onClick={() => startEdit(cat)} className="text-slate-400 hover:text-violet-600">
                  <Pencil size={14} />
                </button>
                <DeleteButton id={cat.id} type="category" />
              </>
            )}
          </div>
        </td>
      </tr>
    )
  }

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([level, cats]) => (
        <div key={level} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
            <h2 className="font-semibold text-slate-700">{LEVEL_LABELS[level]}</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-2">Nombre</th>
                <th className="text-left px-4 py-2">Nivel</th>
                <th className="text-left px-4 py-2">División</th>
                <th className="text-left px-4 py-2">Color</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {cats.map((cat) => <CategoryRow key={cat.id} cat={cat} />)}
            </tbody>
          </table>
        </div>
      ))}

      {/* Add new */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-700">Nueva categoría</h2>
          {!showNew && (
            <button
              onClick={() => setShowNew(true)}
              className="flex items-center gap-1.5 bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700"
            >
              <Plus size={16} /> Agregar
            </button>
          )}
        </div>
        {showNew && (
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre</label>
                <input
                  type="text"
                  className={fieldClass + ' w-full'}
                  placeholder="ej. Streaming"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nivel</label>
                <select
                  className={fieldClass + ' w-full'}
                  value={form.level}
                  onChange={(e) => setForm({ ...form, level: e.target.value })}
                >
                  {Object.entries(LEVEL_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                División: Xime {form.defaultPctXime}% / Dani {form.defaultPctDani}%
              </label>
              <input
                type="range" min="0" max="100" value={form.defaultPctXime}
                onChange={(e) => handlePctXime(Number(e.target.value))}
                className="w-full accent-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Color</label>
              <div className="flex flex-wrap items-center gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c} type="button"
                    onClick={() => setForm({ ...form, color: c })}
                    className={`w-6 h-6 rounded-full border-2 ${form.color === c ? 'border-slate-800' : 'border-transparent'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="w-6 h-6 rounded-full cursor-pointer border-0 p-0 bg-transparent"
                  title="Color personalizado"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={saveNew}
                disabled={saving || !form.name.trim()}
                className="bg-violet-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-violet-700 disabled:opacity-60"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                onClick={() => { setShowNew(false); setForm(emptyForm) }}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

import { prisma } from '@/lib/prisma'
import CategoryManager from '@/components/CategoryManager'

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } })
  return (
    <div className="pb-20 md:pb-0">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Categorías</h1>
        <p className="text-slate-500 text-sm">
          Define las categorías y su división por defecto entre Xime y Dani
        </p>
      </div>
      <CategoryManager categories={categories} />
    </div>
  )
}

import { redirect } from 'next/navigation'
import { getCurrentMonth } from '@/lib/utils'

export default function Home() {
  redirect(`/summary?month=${getCurrentMonth()}`)
}

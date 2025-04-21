import { BookOpen, Dumbbell, Moon, Utensils } from 'lucide-react'

export const challenges: {
  icon: React.ElementType
  label: string
  note?: string
}[] = [
  {
    icon: Utensils,
    label: 'Eat well'
  },
  {
    icon: Moon,
    label: 'Read Quran',
    note: 'At least 1 ayah'
  },
  {
    icon: BookOpen,
    label: 'Read book',
    note: 'At least 1 pages'
  },
  {
    icon: Dumbbell,
    label: 'Daily workout'
  }
]

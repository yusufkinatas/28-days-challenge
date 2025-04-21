import {
  BookOpen,
  Camera,
  Dumbbell,
  GlassWater,
  Utensils,
  Wine
} from 'lucide-react'

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
    icon: GlassWater,
    label: '2 liters of water'
  },
  {
    icon: Dumbbell,
    label: '45 min workout'
  },
  {
    icon: Wine,
    label: 'No drink/smoke'
  },
  {
    icon: BookOpen,
    label: 'Read 10+ pages'
  },
  {
    icon: Camera,
    label: 'Progress photo'
  }
]

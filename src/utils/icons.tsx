import React from 'react'
import {
  BookOpen,
  Camera,
  Dumbbell,
  GlassWater,
  Utensils,
  Wine,
  Book,
  Sun,
  Moon,
  Heart,
  Bike,
  Brain,
  Bed,
  Phone,
  Smile,
  LucideProps,
  LucideIcon
} from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  BookOpen,
  Camera,
  Dumbbell,
  GlassWater,
  Utensils,
  Wine,
  Book,
  Sun,
  Moon,
  Heart,
  Bike,
  Brain,
  Bed,
  Phone,
  Smile
}

/**
 * Converts a string icon name to a Lucide icon component
 * @param iconName The name of the icon from Lucide
 * @param props Additional props to pass to the icon
 * @returns React element or null if icon not found
 */
export const getIcon = (
  iconName: string,
  props: LucideProps = {}
): React.ReactElement | null => {
  const Icon = iconMap[iconName]

  if (!Icon) {
    console.warn(`Icon '${iconName}' not found in iconMap`)
    return null
  }

  return <Icon {...props} />
}

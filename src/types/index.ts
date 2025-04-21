import React from 'react'

export interface Participant {
  name: string
  email: string
  color: string
}

export interface Challenge {
  icon: React.ElementType
  label: string
  note?: string
}

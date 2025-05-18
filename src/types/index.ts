import React from 'react'

export interface Participant {
  name: string
  email: string
  color: string
  uid?: string // Firebase user ID
}

export interface Challenge {
  icon: React.ElementType
  label: string
  note?: string
}

export interface UserProfile {
  uid: string
  displayName: string
  email: string
  color: string
}

// Firebase data models
export interface FirebaseChallenge {
  id?: string
  title: string
  createdBy: string
  createdAt: number
  startDate: number
  endDate: number
  participants: string[] // Array of user IDs
  challenges: ChallengeItem[]
}

export interface ChallengeItem {
  id: string
  label: string
  icon: string
  note?: string
}

export interface CompletionRecord {
  id?: string
  challengeId: string
  userId: string
  day: string
  itemId: string
  completed: boolean
  completedAt: number
  photoUrl?: string // NEW – optional photo attachment
}

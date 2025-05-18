import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
  setDoc
} from 'firebase/firestore'
import { CompletionRecord, FirebaseChallenge, UserProfile } from '../types'
import { auth, db } from './config'

// Challenges Collection
const challengesCollection = collection(db, 'challenges')

// Get all challenges for the current user
export const getUserChallenges = async () => {
  if (!auth.currentUser) return []

  const userChallengesQuery = query(
    challengesCollection,
    where('participants', 'array-contains', auth.currentUser.uid)
  )

  const querySnapshot = await getDocs(userChallengesQuery)
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  })) as FirebaseChallenge[]
}

// Get challenges created by the current user
export const getCreatedChallenges = async () => {
  if (!auth.currentUser) return []

  const createdChallengesQuery = query(
    challengesCollection,
    where('createdBy', '==', auth.currentUser.uid)
  )

  const querySnapshot = await getDocs(createdChallengesQuery)
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  })) as FirebaseChallenge[]
}

// Get a specific challenge by ID
export const getChallenge = async (challengeId: string) => {
  const docRef = doc(db, 'challenges', challengeId)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data()
    } as FirebaseChallenge
  }

  return null
}

// Create a new challenge
export const createChallenge = async (
  challengeData: Omit<FirebaseChallenge, 'id' | 'createdAt'>
) => {
  if (!auth.currentUser) throw new Error('User not authenticated')

  const newChallenge = {
    ...challengeData,
    createdBy: auth.currentUser.uid,
    createdAt: Date.now(),
    participants: [auth.currentUser.uid, ...challengeData.participants]
  }

  const docRef = await addDoc(challengesCollection, newChallenge)
  return {
    id: docRef.id,
    ...newChallenge
  } as FirebaseChallenge
}

// Update a challenge
export const updateChallenge = async (
  challengeId: string,
  data: Partial<FirebaseChallenge>
) => {
  if (!auth.currentUser) throw new Error('User not authenticated')

  const challengeRef = doc(db, 'challenges', challengeId)
  await updateDoc(challengeRef, data)

  return getChallenge(challengeId)
}

// Add a participant to a challenge
export const addParticipantToChallenge = async (
  challengeId: string,
  participantId: string
) => {
  if (!auth.currentUser) throw new Error('User not authenticated')

  const challengeRef = doc(db, 'challenges', challengeId)
  const challenge = await getChallenge(challengeId)

  if (!challenge) throw new Error('Challenge not found')

  // Allow users to add themselves to a challenge
  // Or allow the challenge creator to add participants
  if (
    participantId !== auth.currentUser.uid &&
    challenge.createdBy !== auth.currentUser.uid
  ) {
    throw new Error('Not authorized')
  }

  // Check if participant is already in the challenge
  if (challenge.participants.includes(participantId)) {
    throw new Error('User is already a participant in this challenge')
  }

  const updatedParticipants = [...challenge.participants, participantId]

  await updateDoc(challengeRef, {
    participants: updatedParticipants
  })

  return getChallenge(challengeId)
}

// Remove a participant from a challenge
export const removeParticipantFromChallenge = async (
  challengeId: string,
  participantId: string
) => {
  if (!auth.currentUser) throw new Error('User not authenticated')

  const challengeRef = doc(db, 'challenges', challengeId)
  const challenge = await getChallenge(challengeId)

  if (!challenge) throw new Error('Challenge not found')
  if (challenge.createdBy !== auth.currentUser.uid)
    throw new Error('Not authorized')

  const updatedParticipants = challenge.participants.filter(
    (id) => id !== participantId
  )

  await updateDoc(challengeRef, {
    participants: updatedParticipants
  })

  return getChallenge(challengeId)
}

// Delete a challenge
export const deleteChallenge = async (challengeId: string) => {
  if (!auth.currentUser) throw new Error('User not authenticated')

  const challenge = await getChallenge(challengeId)

  if (!challenge) throw new Error('Challenge not found')
  if (challenge.createdBy !== auth.currentUser.uid)
    throw new Error('Not authorized')

  await deleteDoc(doc(db, 'challenges', challengeId))

  return true
}

// Completions Collection
const completionsCollection = collection(db, 'completions')

// Get completions for a specific challenge and user
export const getChallengeCompletions = async (
  challengeId: string,
  userId: string
) => {
  const completionsQuery = query(
    completionsCollection,
    where('challengeId', '==', challengeId),
    where('userId', '==', userId)
  )

  const querySnapshot = await getDocs(completionsQuery)
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  })) as CompletionRecord[]
}

// Toggle completion status
export const toggleCompletion = async (
  data: Omit<CompletionRecord, 'id' | 'completedAt'>
) => {
  if (!auth.currentUser) throw new Error('User not authenticated')

  // Check if a completion record already exists
  const completionsQuery = query(
    completionsCollection,
    where('challengeId', '==', data.challengeId),
    where('userId', '==', data.userId),
    where('day', '==', data.day),
    where('itemId', '==', data.itemId)
  )

  const querySnapshot = await getDocs(completionsQuery)

  if (querySnapshot.empty) {
    // Create a new completion record
    const newCompletion: CompletionRecord = {
      ...data,
      completed: true,
      completedAt: Date.now(),
      photoUrl: '' // placeholder; updated later if user uploads a photo
    }

    const docRef = await addDoc(completionsCollection, newCompletion)
    return {
      id: docRef.id,
      ...newCompletion
    }
  } else {
    // Update existing completion record
    const existingDoc = querySnapshot.docs[0]
    const existingData = existingDoc.data() as CompletionRecord

    const updatedCompletion = {
      ...existingData,
      completed: !existingData.completed,
      completedAt: Date.now()
    }

    await updateDoc(doc(db, 'completions', existingDoc.id), updatedCompletion)

    return {
      id: existingDoc.id,
      ...updatedCompletion
    }
  }
}

export const updateCompletionPhoto = async (
  completionId: string,
  photoUrl: string
) => {
  const completionRef = doc(db, 'completions', completionId)
  await updateDoc(completionRef, { photoUrl })

  const snap = await getDoc(completionRef)
  if (!snap.exists()) throw new Error('Completion not found')

  return { id: snap.id, ...snap.data() } as CompletionRecord
}

// User Profiles Collection
// Get user profile
export const getUserProfile = async (userId: string) => {
  const docRef = doc(db, 'users', userId)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    return {
      uid: docSnap.id,
      ...docSnap.data()
    } as UserProfile
  }

  // If user profile doesn't exist, create a default one
  if (auth.currentUser && userId === auth.currentUser.uid) {
    const defaultProfile: UserProfile = {
      uid: userId,
      displayName: auth.currentUser.email?.split('@')[0] || 'User',
      email: auth.currentUser.email || '',
      color: getRandomColor()
    }

    await setDoc(docRef, {
      displayName: defaultProfile.displayName,
      email: defaultProfile.email,
      color: defaultProfile.color
    })

    return defaultProfile
  }

  return null
}

// Get multiple user profiles
export const getUserProfiles = async (userIds: string[]) => {
  const profiles: UserProfile[] = []

  // De-duplicate user IDs
  const uniqueUserIds = [...new Set(userIds)]

  for (const userId of uniqueUserIds) {
    const profile = await getUserProfile(userId)
    if (profile) {
      profiles.push(profile)
    }
  }

  return profiles
}

// Update user profile
export const updateUserProfile = async (profile: Partial<UserProfile>) => {
  if (!auth.currentUser) throw new Error('User not authenticated')

  const userId = auth.currentUser.uid
  const docRef = doc(db, 'users', userId)

  await updateDoc(docRef, profile)

  return getUserProfile(userId)
}

// Helper function to generate a random color
function getRandomColor() {
  const colors = [
    '#4f46e5', // indigo
    '#ef4444', // red
    '#16a34a', // green
    '#f59e0b', // amber
    '#06b6d4', // cyan
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#6366f1', // blue
    '#f97316', // orange
    '#14b8a6' // teal
  ]

  return colors[Math.floor(Math.random() * colors.length)]
}

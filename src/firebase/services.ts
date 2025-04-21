import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
  setDoc
} from 'firebase/firestore'
import { auth, db } from './config'
import { CompletionRecord, FirebaseChallenge } from '../types'

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
  if (challenge.createdBy !== auth.currentUser.uid)
    throw new Error('Not authorized')

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
    const newCompletion = {
      ...data,
      completed: true,
      completedAt: Date.now()
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

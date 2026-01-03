import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, writeBatch, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { MatchResult } from '../types';

const COLLECTION_NAME = 'matches';

export const saveMatchResult = async (match: Omit<MatchResult, 'id' | 'createdAt'>): Promise<string> => {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...match,
    createdAt: Date.now()
  });
  return docRef.id;
};

export const updateMatchResult = async (id: string, match: Partial<MatchResult>): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    ...match,
    updatedAt: Date.now()
  });
};

export const fetchMatchResults = async (): Promise<MatchResult[]> => {
  const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as MatchResult));
};

export const deleteMatchResult = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTION_NAME, id));
};

export const deleteMultipleMatchResults = async (ids: string[]): Promise<void> => {
  const batch = writeBatch(db);
  ids.forEach((id) => {
    const docRef = doc(db, COLLECTION_NAME, id);
    batch.delete(docRef);
  });
  await batch.commit();
};
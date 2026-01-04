
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
  // 복합 인덱스 생성이 필요한 다중 orderBy를 제거하고 date 단일 필드로 정렬합니다.
  // 추가적인 정렬(동일 날짜 내 생성순 등)은 클라이언트 측 memo에서 처리됩니다.
  const q = query(
    collection(db, COLLECTION_NAME), 
    orderBy('date', 'desc')
  );
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

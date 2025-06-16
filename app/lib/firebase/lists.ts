import { db } from './firebase';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';

const LISTS_COLLECTION = 'lists';

export interface List {
  id?: string;
  name: string;
  students: string[];
  createdAt: any;
  owner: string;
}

// 新增名單
export async function addList(list: Omit<List, 'id' | 'createdAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, LISTS_COLLECTION), {
    ...list,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

// 取得所有名單
export async function getAllLists(): Promise<List[]> {
  const querySnapshot = await getDocs(collection(db, LISTS_COLLECTION));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as List));
}

// 取得單一名單
export async function getListById(id: string): Promise<List | null> {
  const listRef = doc(db, LISTS_COLLECTION, id);
  const listSnap = await getDoc(listRef);
  if (listSnap.exists()) {
    return { id: listSnap.id, ...listSnap.data() } as List;
  }
  return null;
}

// 更新名單
export async function updateList(id: string, list: Partial<List>): Promise<void> {
  const listRef = doc(db, LISTS_COLLECTION, id);
  await updateDoc(listRef, list);
}

// 刪除名單
export async function deleteList(id: string): Promise<void> {
  const listRef = doc(db, LISTS_COLLECTION, id);
  await deleteDoc(listRef);
} 
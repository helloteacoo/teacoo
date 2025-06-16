import { db } from './firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDoc, getDocs, orderBy, query } from 'firebase/firestore';

const QUIZZES_COLLECTION = 'quizzes';

export interface Quiz {
  id?: string;
  title: string;
  description?: string;
  createdAt: string;
  questionIds: string[];
  // 你可以根據需求擴充欄位
}

// 新增 quiz
export async function addQuiz(quiz: Omit<Quiz, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, QUIZZES_COLLECTION), quiz);
  return docRef.id;
}

// 取得所有 quiz
export async function getAllQuizzes(): Promise<Quiz[]> {
  const quizzesQuery = query(collection(db, QUIZZES_COLLECTION), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(quizzesQuery);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quiz));
}

// 取得單一 quiz
export async function getQuizById(id: string): Promise<Quiz | null> {
  const quizRef = doc(db, QUIZZES_COLLECTION, id);
  const quizSnap = await getDoc(quizRef);
  if (quizSnap.exists()) {
    return { id: quizSnap.id, ...quizSnap.data() } as Quiz;
  }
  return null;
}

// 更新 quiz
export async function updateQuiz(id: string, quiz: Partial<Quiz>): Promise<void> {
  const quizRef = doc(db, QUIZZES_COLLECTION, id);
  await updateDoc(quizRef, quiz);
}

// 刪除 quiz
export async function deleteQuiz(id: string): Promise<void> {
  const quizRef = doc(db, QUIZZES_COLLECTION, id);
  await deleteDoc(quizRef);
} 
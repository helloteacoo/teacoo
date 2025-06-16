import { db } from './firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, orderBy } from 'firebase/firestore';
import type { Question } from '@/app/types/question';

const QUESTIONS_COLLECTION = 'questions';

// 新增題目
export async function addQuestion(question: Omit<Question, 'id'>): Promise<string> {
  try {
    // 不要在內容欄位存 id，Firestore 文件 id 才是唯一識別
    const { id, ...rest } = question as any; // 移除內容的 id 欄位
    const docRef = await addDoc(collection(db, QUESTIONS_COLLECTION), rest);
    return docRef.id;
  } catch (error) {
    console.error('新增題目失敗:', error);
    throw error;
  }
}

// 更新題目
export async function updateQuestion(id: string, question: Partial<Question>): Promise<void> {
  try {
    const { id: _id, ...rest } = question as any; // 移除內容的 id 欄位
    const questionRef = doc(db, QUESTIONS_COLLECTION, id);
    await updateDoc(questionRef, {
      ...rest,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('更新題目失敗:', error);
    throw error;
  }
}

// 刪除題目
export async function deleteQuestion(id: string): Promise<void> {
  try {
    console.log('嘗試刪除 Firestore 文件 id:', id);
    const questionRef = doc(db, QUESTIONS_COLLECTION, id);
    await deleteDoc(questionRef);
    console.log('刪除成功:', id);
  } catch (error) {
    console.error('刪除題目失敗:', error, id);
    throw error;
  }
}

// 獲取所有題目
export async function getAllQuestions(): Promise<Question[]> {
  try {
    const questionsQuery = query(
      collection(db, QUESTIONS_COLLECTION),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(questionsQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Question));
  } catch (error) {
    console.error('獲取題目失敗:', error);
    throw error;
  }
}

// 根據標籤獲取題目
export async function getQuestionsByTags(tags: string[]): Promise<Question[]> {
  try {
    const questionsQuery = query(
      collection(db, QUESTIONS_COLLECTION),
      where('tags', 'array-contains-any', tags),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(questionsQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Question));
  } catch (error) {
    console.error('根據標籤獲取題目失敗:', error);
    throw error;
  }
}

// 根據關鍵字搜尋題目
export async function searchQuestions(keyword: string): Promise<Question[]> {
  try {
    const questionsQuery = query(
      collection(db, QUESTIONS_COLLECTION),
      orderBy('content'),
      where('content', '>=', keyword),
      where('content', '<=', keyword + '\uf8ff')
    );
    const querySnapshot = await getDocs(questionsQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Question));
  } catch (error) {
    console.error('搜尋題目失敗:', error);
    throw error;
  }
} 
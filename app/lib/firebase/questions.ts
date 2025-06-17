import { db } from './firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, orderBy, getDoc } from 'firebase/firestore';
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
  if (!id) {
    throw new Error('刪除題目時必須提供有效的 ID');
  }

  try {
    const questionRef = doc(db, QUESTIONS_COLLECTION, id);
    
    // 先確認文件是否存在
    const docSnap = await getDoc(questionRef);
    if (!docSnap.exists()) {
      throw new Error(`找不到 ID 為 ${id} 的題目`);
    }

    // 執行刪除操作
    await deleteDoc(questionRef);
    console.log('成功刪除題目:', id);
  } catch (error) {
    console.error('刪除題目時發生錯誤:', error);
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
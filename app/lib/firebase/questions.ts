import { db } from './firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, orderBy, getDoc, Timestamp } from 'firebase/firestore';
import type { Question } from '@/app/types/question';
import { auth } from './firebase';

const QUESTIONS_COLLECTION = 'questions';

// 處理時間戳記轉換
function convertTimestamp(timestamp: any): string {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toISOString();
  }
  if (typeof timestamp === 'string') {
    return timestamp;
  }
  return new Date().toISOString();
}

// 處理文件資料轉換
function convertDocData(doc: any): Question {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: convertTimestamp(data.createdAt),
    updatedAt: convertTimestamp(data.updatedAt)
  } as Question;
}

// 新增題目
export async function addQuestion(question: Omit<Question, 'id'>): Promise<string> {
  try {
    console.log('開始新增題目:', question.content);
    // 不要在內容欄位存 id，Firestore 文件 id 才是唯一識別
    const { id, ...rest } = question as any; // 移除內容的 id 欄位
    const docRef = await addDoc(collection(db, QUESTIONS_COLLECTION), {
      ...rest,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    console.log('題目新增成功，ID:', docRef.id);
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
      updatedAt: Timestamp.now()
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
    console.log('開始獲取所有題目...');
    const questionsRef = collection(db, QUESTIONS_COLLECTION);
    console.log('建立 questions collection 參考:', QUESTIONS_COLLECTION);

    // 檢查 auth 狀態
    const currentUser = auth.currentUser;
    console.log('當前用戶狀態:', currentUser ? '已登入' : '未登入', currentUser?.uid);

    try {
      // 不使用 orderBy，直接獲取所有題目
      const querySnapshot = await getDocs(questionsRef);
      console.log('獲取題目快照，數量:', querySnapshot.size);

      const questions = querySnapshot.docs.map(convertDocData);

      // 在記憶體中進行排序
      questions.sort((a, b) => {
        if (a.createdAt instanceof Timestamp && b.createdAt instanceof Timestamp) {
          return b.createdAt.toMillis() - a.createdAt.toMillis();
        }
        const dateA = new Date(a.createdAt.toString());
        const dateB = new Date(b.createdAt.toString());
        return dateB.getTime() - dateA.getTime();
      });

      console.log('處理完成，總題目數:', questions.length);
      return questions;
    } catch (error: any) {
      console.error('獲取題目時發生錯誤:', error.code, error.message);
      if (error.code === 'permission-denied') {
        console.error('權限被拒絕，請確認 Firestore 規則設定');
      }
      throw error;
    }
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
    return querySnapshot.docs.map(convertDocData);
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
    return querySnapshot.docs.map(convertDocData);
  } catch (error) {
    console.error('搜尋題目失敗:', error);
    throw error;
  }
} 
import { db } from './firebase';
import { collection, addDoc, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';

export interface QuizResponse {
  id?: string;
  name: string;
  answers: Record<string, string | string[]>;
  score: number;
  duration: number;
  submittedAt: Timestamp;
}

// 儲存作答紀錄（支援指派模式和練習模式）
export async function saveQuizResponse(
  quizId: string,
  mode: 'assign' | 'practice',
  response: Omit<QuizResponse, 'submittedAt' | 'id'>
): Promise<string> {
  try {
    const collectionPath = mode === 'assign' ? 'quizResponses' : 'practiceResponses';
    const responseData = {
      ...response,
      submittedAt: Timestamp.now()
    };

    console.log(`準備儲存${mode === 'assign' ? '指派' : '練習'}作答紀錄：`, {
      quizId,
      collectionPath,
      responseData
    });

    const docRef = await addDoc(
      collection(db, collectionPath, quizId, 'responses'),
      responseData
    );

    console.log('成功儲存作答紀錄，文件ID：', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('儲存作答紀錄失敗：', error);
    throw error;
  }
}

// 取得指定測驗的所有作答紀錄
export async function getQuizResponses(
  quizId: string,
  mode: 'assign' | 'practice'
): Promise<QuizResponse[]> {
  try {
    const collectionPath = mode === 'assign' ? 'quizResponses' : 'practiceResponses';
    const responsesQuery = query(
      collection(db, collectionPath, quizId, 'responses'),
      orderBy('submittedAt', 'desc')
    );

    const querySnapshot = await getDocs(responsesQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<QuizResponse, 'id'>)
    }));
  } catch (error) {
    console.error('取得作答紀錄失敗：', error);
    throw error;
  }
}

// 取得指定測驗的所有作答紀錄（包含兩種模式）
export async function getAllQuizResponses(quizId: string): Promise<(QuizResponse & { mode: 'assign' | 'practice' })[]> {
  try {
    const [assignResponses, practiceResponses] = await Promise.all([
      getQuizResponses(quizId, 'assign'),
      getQuizResponses(quizId, 'practice')
    ]);

    return [
      ...assignResponses.map(response => ({ ...response, mode: 'assign' as const })),
      ...practiceResponses.map(response => ({ ...response, mode: 'practice' as const }))
    ].sort((a, b) => b.submittedAt.toMillis() - a.submittedAt.toMillis());
  } catch (error) {
    console.error('取得所有作答紀錄失敗：', error);
    throw error;
  }
} 
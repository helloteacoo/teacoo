import { db } from './firebase';
import { collection, addDoc, getDocs, query, orderBy, Timestamp, getDoc, doc } from 'firebase/firestore';
import { Question, ReadingQuestion, ClozeQuestion } from '@/app/types/question';

interface Quiz {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  questionIds: string[];
}

export interface QuizResponse {
  id?: string;
  name: string;
  answers: Record<string, string | string[]>;
  score: number;
  duration: number;
  submittedAt: Timestamp;
}

export interface ProcessedQuizResponse {
  id: string;
  name: string;
  score: number;
  totalQuestions: number;
  wrongQuestions: number;
  percentage: number;
  submitTime: string;
  duration: string;
  answers: Record<string, string | string[]>;
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

// 格式化時間戳記為日期時間字串
function formatTimestamp(timestamp: Timestamp): string {
  return new Date(timestamp.toMillis()).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// 格式化持續時間（毫秒）為時分秒字串
function formatDuration(duration: number): string {
  const hours = Math.floor(duration / 3600000);
  const minutes = Math.floor((duration % 3600000) / 60000);
  const seconds = Math.floor((duration % 60000) / 1000);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// 獲取測驗結果的詳細資訊
export async function getQuizResultDetails(quizId: string) {
  try {
    console.log('開始獲取測驗結果，quizId:', quizId);
    
    // 1. 獲取測驗基本資訊
    const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
    if (!quizDoc.exists()) {
      throw new Error('測驗不存在');
    }
    const quiz = { id: quizDoc.id, ...quizDoc.data() } as Quiz;
    console.log('獲取到的測驗資訊:', quiz);

    // 2. 獲取所有題目
    const questions = await Promise.all(
      quiz.questionIds.map(async (qId) => {
        const questionDoc = await getDoc(doc(db, 'questions', qId));
        if (!questionDoc.exists()) {
          console.warn(`題目 ${qId} 不存在`);
          return null;
        }
        return { id: questionDoc.id, ...questionDoc.data() } as Question;
      })
    );
    const validQuestions = questions.filter((q): q is Question => q !== null);
    console.log('獲取到的題目:', validQuestions);

    // 3. 獲取所有作答記錄
    const [assignResponses, practiceResponses] = await Promise.all([
      getQuizResponses(quizId, 'assign'),
      getQuizResponses(quizId, 'practice')
    ]);
    console.log('獲取到的作答記錄:', { assignResponses, practiceResponses });

    // 4. 處理作答記錄
    const processResponses = (responses: QuizResponse[]): ProcessedQuizResponse[] => {
      return responses.map(response => {
        // 計算答對題數
        let correctCount = 0;
        let totalQuestions = 0;

        validQuestions.forEach(q => {
          const userAnswer = response.answers[q.id];
          if (q.type === '單選題') {
            totalQuestions++;
            if (userAnswer === q.options[q.answer]) correctCount++;
          } else if (q.type === '多選題') {
            totalQuestions++;
            const correctAnswers = q.answers.map(idx => q.options[idx]);
            if (Array.isArray(userAnswer) &&
                userAnswer.length === correctAnswers.length &&
                userAnswer.every(a => correctAnswers.includes(a))) {
              correctCount++;
            }
          } else if (q.type === '閱讀測驗') {
            const readingQ = q as ReadingQuestion;
            totalQuestions += readingQ.questions.length;
            if (Array.isArray(userAnswer)) {
              readingQ.questions.forEach((subQ, idx) => {
                if (userAnswer[idx] === subQ.options[parseInt(subQ.answer)]) correctCount++;
              });
            }
          } else if (q.type === '克漏字') {
            const clozeQ = q as ClozeQuestion;
            totalQuestions += clozeQ.questions.length;
            if (Array.isArray(userAnswer)) {
              clozeQ.questions.forEach((subQ, idx) => {
                if (userAnswer[idx] === subQ.options[subQ.answer]) correctCount++;
              });
            }
          }
        });

        return {
          id: response.id || '',
          name: response.name,
          score: correctCount,
          totalQuestions,
          wrongQuestions: totalQuestions - correctCount,
          percentage: Math.round((correctCount / totalQuestions) * 100),
          submitTime: formatTimestamp(response.submittedAt),
          duration: formatDuration(response.duration),
          answers: response.answers
        };
      });
    };

    // 5. 整理最終結果
    const assignResults = processResponses(assignResponses);
    const practiceResults = processResponses(practiceResponses);
    console.log('處理後的結果:', { assignResults, practiceResults });

    return {
      quiz: {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        createdAt: quiz.createdAt,
        totalQuestions: validQuestions.length
      },
      questions: validQuestions,
      assignResults,
      practiceResults
    };
  } catch (error) {
    console.error('獲取測驗結果詳細資訊失敗：', error);
    throw error;
  }
} 
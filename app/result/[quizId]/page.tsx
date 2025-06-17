"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc, collection, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Question } from '@/app/types/question';
import { toast } from 'sonner';

interface Quiz {
  title: string;
  useTargetList: boolean;
  targetList: string[];
  questions: Question[];
  createdAt: Timestamp;
}

interface QuizResponse {
  name: string;
  answers: Record<string, string | string[]>;
  score: number;
  duration: number;
  submittedAt: Timestamp;
  mode: 'assign' | 'practice';
}

export default function ResultPage() {
  const params = useParams();
  const quizId = params?.quizId as string;
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [responses, setResponses] = useState<QuizResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('開始載入資料，quizId:', quizId);
        
        // 載入試卷資料
        const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
        if (!quizDoc.exists()) {
          console.error('找不到試卷文件');
          toast.error('找不到此試卷');
          return;
        }
        const quizData = quizDoc.data() as Quiz;
        console.log('試卷資料:', quizData);
        setQuiz(quizData);

        // 載入作答紀錄
        console.log('開始載入作答紀錄');
        const assignResponsesRef = collection(db, 'quizResponses', quizId, 'responses');
        const practiceResponsesRef = collection(db, 'practiceResponses', quizId, 'responses');

        const [assignResponsesSnapshot, practiceResponsesSnapshot] = await Promise.all([
          getDocs(assignResponsesRef),
          getDocs(practiceResponsesRef)
        ]);

        console.log('指派作答數量:', assignResponsesSnapshot.size);
        console.log('練習作答數量:', practiceResponsesSnapshot.size);

        const assignResponses = assignResponsesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data() as QuizResponse,
          mode: 'assign' as const
        }));

        const practiceResponses = practiceResponsesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data() as QuizResponse,
          mode: 'practice' as const
        }));

        console.log('指派作答紀錄:', assignResponses);
        console.log('練習作答紀錄:', practiceResponses);

        // 合併兩種模式的作答紀錄並按時間排序
        const allResponses = [...assignResponses, ...practiceResponses].sort((a, b) => 
          b.submittedAt.toMillis() - a.submittedAt.toMillis()
        );

        console.log('合併後的作答紀錄:', allResponses);
        setResponses(allResponses);
      } catch (error) {
        console.error('載入資料失敗:', error);
        toast.error('載入資料失敗');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [quizId]);

  if (loading) {
    return <div className="container mx-auto px-4 py-8">載入中...</div>;
  }

  if (!quiz) {
    return <div className="container mx-auto px-4 py-8">找不到此試卷</div>;
  }

  // 計算未作答的學生（只考慮指派模式的作答紀錄）
  const assignResponses = responses.filter(r => r.mode === 'assign');
  const notSubmittedStudents = quiz.useTargetList
    ? quiz.targetList.filter(
        name => !assignResponses.some(response => response.name === name)
      )
    : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">📊 作答結果</h1>

      {/* 作答統計 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 shadow-md">
        <h2 className="text-xl font-semibold mb-4">📈 統計資訊</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">總作答次數</p>
            <p className="text-2xl font-bold">{responses.length}</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">指派模式作答次數</p>
            <p className="text-2xl font-bold">{responses.filter(r => r.mode === 'assign').length}</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">練習模式作答次數</p>
            <p className="text-2xl font-bold">{responses.filter(r => r.mode === 'practice').length}</p>
          </div>
        </div>
      </div>

      {/* 作答紀錄列表 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
        <h2 className="text-xl font-semibold mb-4">📝 作答紀錄</h2>
        <div className="space-y-4">
          {responses.map((response, index) => (
            <div key={index} className="border dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{response.name}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    response.mode === 'assign' 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  }`}>
                    {response.mode === 'assign' ? '指派' : '練習'}
                  </span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {response.submittedAt.toDate().toLocaleString()}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div>得分：{response.score} / {quiz.questions.length} ({Math.round((response.score / quiz.questions.length) * 100)}%)</div>
                <div>用時：{Math.floor(response.duration / 60000)} 分 {Math.floor((response.duration % 60000) / 1000)} 秒</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 未作答學生列表（只顯示指派模式） */}
      {quiz.useTargetList && notSubmittedStudents.length > 0 && (
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-semibold mb-4">❗ 未作答學生</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {notSubmittedStudents.map(name => (
              <div key={name} className="p-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-200 rounded">
                {name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 
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
        // 載入試卷資料
        const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
        if (!quizDoc.exists()) {
          toast.error('找不到此試卷');
          return;
        }
        setQuiz(quizDoc.data() as Quiz);

        // 載入作答紀錄
        const responsesSnapshot = await getDocs(
          collection(db, 'quizResponses', quizId, 'responses')
        );
        const responsesList = responsesSnapshot.docs.map(doc => doc.data() as QuizResponse);
        setResponses(responsesList);
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

  // 計算未作答的學生
  const notSubmittedStudents = quiz.useTargetList
    ? quiz.targetList.filter(
        name => !responses.some(response => response.name === name)
      )
    : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">{quiz.title}</h1>
      <p className="text-gray-500 mb-6">
        建立時間：{quiz.createdAt.toDate().toLocaleString()}
      </p>

      <div className="bg-card p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">📊 作答狀況</h2>
        <div className="space-y-2">
          {responses.map(response => {
            const minutes = Math.floor(response.duration / 60000);
            const seconds = Math.floor((response.duration % 60000) / 1000);
            return (
              <div
                key={response.name}
                className="flex items-center justify-between p-3 bg-muted rounded"
              >
                <div>
                  <span className="font-medium">👤 {response.name}：</span>
                  <span className="ml-2">
                    {response.score}/{quiz.questions.length} 題
                  </span>
                </div>
                <div className="text-gray-500">
                  🕒 {minutes}:{seconds.toString().padStart(2, '0')}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {quiz.useTargetList && notSubmittedStudents.length > 0 && (
        <div className="bg-card p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">⚠️ 尚未作答</h2>
          <div className="space-y-2">
            {notSubmittedStudents.map(name => (
              <div key={name} className="p-3 bg-muted rounded">
                👤 {name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 
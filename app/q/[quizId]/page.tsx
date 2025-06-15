'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/auth';
import { useRouter } from 'next/navigation';

export default function QuizPage({ params }: { params: { quizId: string } }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [quizData, setQuizData] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    // 在這裡加載測驗資料
    const loadQuizData = async () => {
      try {
        const response = await fetch(`/api/quiz/${params.quizId}`);
        if (!response.ok) {
          throw new Error('無法載入測驗資料');
        }
        const data = await response.json();
        setQuizData(data);
      } catch (error) {
        console.error('載入測驗資料時發生錯誤:', error);
      }
    };

    if (user) {
      loadQuizData();
    }
  }, [user, loading, router, params.quizId]);

  if (loading) {
    return <div>載入中...</div>;
  }

  if (!quizData) {
    return <div>載入測驗資料中...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">測驗頁面</h1>
      {/* 在這裡加入測驗內容 */}
    </div>
  );
} 
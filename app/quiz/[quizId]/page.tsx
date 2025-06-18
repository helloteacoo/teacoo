"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc, collection, addDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Textarea } from '@/app/components/ui/textarea';
import { toast } from 'sonner';
import { 
  Question, 
  ReadingQuestion, 
  ClozeQuestion, 
  SingleChoiceQuestion,
  MultipleChoiceQuestion,
  SubQuestion 
} from '@/app/types/question';
import { useTheme } from '@/app/contexts/ThemeContext';
import { SunIcon, MoonIcon } from '@radix-ui/react-icons';

type AnswerValue = string | Array<string>;
type Answers = Record<string, AnswerValue>;

interface Quiz {
  title: string;
  questions: Question[];
  settings: {
    showTimer: boolean;
    targetList: string[];
  };
  mode: 'assign' | 'practice';
  deadline?: string;  // 可選的截止日期
}

const QUESTIONS_PER_PAGE = 10;

export default function StudentQuizPage() {
  const params = useParams();
  const quizId = params?.quizId as string;
  const { theme, toggleTheme } = useTheme();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timer, setTimer] = useState('00:00:00');
  const [answers, setAnswers] = useState<Answers>({});
  const answersRef = useRef<Answers>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [duration, setDuration] = useState(0);
  const [page, setPage] = useState(1);
  const [questions, setQuestions] = useState<Question[]>([]);

  // 載入 quiz 與題目
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
        if (!quizDoc.exists()) {
          toast.error('找不到此試卷');
          setLoading(false);
          return;
        }
        const quizData = quizDoc.data();
        let qs: Question[] = [];
        if (quizData.questionIds && quizData.questionIds.length > 0) {
          const fetched: Question[] = [];
          for (const id of quizData.questionIds) {
            try {
              const docSnap = await getDoc(doc(db, 'questions', id));
              if (docSnap.exists()) {
                const { id: _, ...questionData } = docSnap.data() as Question;
                fetched.push({ id, ...questionData });
              } else {
                console.warn(`❗ 找不到題目 ID：${id}`);
              }
            } catch (e) {
              console.error(`❗ 載入題目失敗 ID: ${id}`, e);
            }
          }
          qs = fetched;
        }
        
        // 確保從 Firestore 讀取完整的 quiz 資料
        const fullQuizData: Quiz = {
          title: quizData.title || '',
          questions: qs,
          settings: {
            showTimer: quizData.settings?.showTimer || false,
            targetList: quizData.settings?.targetList || []
          },
          mode: quizData.mode || 'assign',
          deadline: quizData.deadline || undefined
        };
        
        console.log('Quiz Data:', fullQuizData); // 用於除錯
        setQuiz(fullQuizData);
        setQuestions(qs);

        // 如果是自我練習模式，自動開始作答
        if (fullQuizData.mode === 'practice') {
          setName('練習者');
          setStartTime(Date.now());
        }
      } catch (error) {
        console.error('載入試卷失敗:', error);
        toast.error('載入試卷失敗');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId]);

  // 計時器
  useEffect(() => {
    if (!startTime || !quiz?.settings?.showTimer) return;
    
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = now - startTime;
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimer(
        `${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, quiz?.settings?.showTimer]);

  // 分頁題目
  const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);
  const pagedQuestions = useMemo(() => {
    const start = (page - 1) * QUESTIONS_PER_PAGE;
    return questions.slice(start, start + QUESTIONS_PER_PAGE);
  }, [questions, page]);

  // 已完成題數
  const completedCount = useMemo(() =>
    Object.keys(answers).filter(qid => answers[qid] !== '' && answers[qid] !== undefined).length,
    [answers]
  );

  // 檢查本頁是否有未填題目
  const getFirstUnansweredIndex = () => {
    for (let i = 0; i < pagedQuestions.length; i++) {
      const q = pagedQuestions[i];
      const answer = answers[q.id];
      if (!answer || answer === '' || (Array.isArray(answer) && answer.length === 0)) {
        return i;
      }
    }
    return -1;
  };

  // 開始作答
  const handleStart = () => {
    if (quiz?.mode === 'assign') {
      if (!name) {
        toast.error('請輸入姓名');
        return;
      }
      if (quiz?.settings?.targetList?.length > 0 && !quiz.settings.targetList.includes(name)) {
        toast.error('查無此姓名');
        return;
      }
    }
    setStartTime(Date.now());
  };

  // 更新答案
  const handleAnswerChange = (questionId: string, answer: AnswerValue) => {
    console.log(`📝 答案更新：${questionId}`, answer);
    const newAnswers = { ...answersRef.current, [questionId]: answer };
    answersRef.current = newAnswers;
    setAnswers(newAnswers);
  };

  // 翻頁
  const handlePageChange = (next: number) => {
    const firstUnanswered = getFirstUnansweredIndex();
    if (firstUnanswered !== -1) {
      toast.error(`請填寫第 ${firstUnanswered + 1} 題`);
      return;
    }
    setPage(next);
  };

  // 提交作答
  const handleSubmit = async () => {
    if (!quiz || !startTime) return;
    // 檢查所有題目都已完成
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const answer = answersRef.current[q.id];
      if (!answer || answer === '' || (Array.isArray(answer) && answer.length === 0)) {
        toast.error(`請填寫第 ${i + 1} 題`);
        setPage(Math.floor(i / QUESTIONS_PER_PAGE) + 1);
        return;
      }
    }
    try {
      setSubmitting(true);
      const endTime = Date.now();
      const duration = endTime - startTime;
      // 計算分數
      let correctCount = 0;
      questions.forEach(q => {
        const userAnswer = answersRef.current[q.id];
        if (q.type === '單選題' && userAnswer === q.options[q.answer]) correctCount++;
        if (q.type === '多選題') {
          const correctAnswers = q.answers.map((idx: number) => q.options[idx]);
          if (Array.isArray(userAnswer) && userAnswer.length === correctAnswers.length && userAnswer.every(a => correctAnswers.includes(a))) correctCount++;
        }
        if (q.type === '閱讀測驗') {
          const readingQ = q as ReadingQuestion;
          if (Array.isArray(userAnswer)) {
            readingQ.questions.forEach((subQ, idx) => {
              if (userAnswer[idx] === subQ.answer) correctCount++;
            });
          }
        }
        if (q.type === '克漏字') {
          const clozeQ = q as ClozeQuestion;
          if (Array.isArray(userAnswer)) {
            clozeQ.questions.forEach((subQ, idx) => {
              if (userAnswer[idx] === subQ.options[subQ.answer]) correctCount++;
            });
          }
        }
      });

      // 根據模式儲存答案到不同的 collection
      const responseData = {
        name,
        answers: answersRef.current,
        score: correctCount,
        duration,
        submittedAt: Timestamp.now()
      };

      // 詳細記錄要寫入的資料
      console.log('===== 準備儲存作答紀錄 =====');
      console.log('測驗模式:', quiz.mode);
      console.log('測驗ID:', quizId);
      console.log('作答者:', name);
      console.log('得分:', correctCount, '/', questions.length);
      console.log('作答時間:', Math.floor(duration / 60000), '分', Math.floor((duration % 60000) / 1000), '秒');
      console.log('答案內容:', JSON.stringify(answersRef.current, null, 2));
      console.log('完整 responseData:', JSON.stringify(responseData, null, 2));

      // 檢查資料完整性
      if (!name || typeof name !== 'string') {
        throw new Error('作答者姓名無效');
      }
      if (!answersRef.current || typeof answersRef.current !== 'object' || Object.keys(answersRef.current).length === 0) {
        throw new Error('答案內容無效');
      }
      if (typeof correctCount !== 'number' || correctCount < 0) {
        throw new Error('得分計算無效');
      }
      if (typeof duration !== 'number' || duration <= 0) {
        throw new Error('作答時間無效');
      }

      try {
        const collectionPath = quiz.mode === 'assign' ? 'quizResponses' : 'practiceResponses';
        const docRef = await addDoc(collection(db, collectionPath, quizId, 'responses'), responseData);
        console.log('✅ 成功儲存作答紀錄');
        console.log('儲存位置:', `${collectionPath}/${quizId}/responses/${docRef.id}`);
        
        // 驗證寫入的資料
        const writtenDoc = await getDoc(docRef);
        if (writtenDoc.exists()) {
          console.log('📦 實際寫入內容：', JSON.stringify(writtenDoc.data(), null, 2));
        } else {
          console.error('❌ 寫入後無法讀取文件');
          throw new Error('寫入後無法讀取文件');
        }
        console.log('========================');
      } catch (error) {
        console.error('❌ 儲存作答紀錄失敗：', error);
        throw error;
      }

      setScore(correctCount);
      setDuration(duration);
      setSubmitted(true);
      toast.success('提交成功！');
    } catch (error) {
      console.error('提交失敗:', error);
      toast.error('提交失敗，請稍後再試');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mainBg dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-400">載入中...</div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mainBg dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-400">找不到此試卷</div>
      </div>
    );
  }

  if (!startTime) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-mainBg dark:bg-gray-900 p-4">
        <div className="w-full max-w-md space-y-4">
          <div className="text-center space-y-2">
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">📃{quiz.title}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              共 {questions.length} 題
            </p>
          </div>

          {/* 只在派發作業模式下顯示姓名輸入 */}
          {quiz.mode === 'assign' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                請輸入姓名
              </label>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="請輸入姓名"
                className="w-full text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-400 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
              />
            </div>
          )}

          <Button onClick={handleStart} className="w-full">
            開始作答
          </Button>
        </div>
      </div>
    );
  }

  if (submitted) {
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-mainBg dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">✅ 作業已完成！</h1>
          <p className="text-lg mb-2 text-gray-700 dark:text-gray-200">🎯 得分：{score} / {questions.length} 題正確（{Math.round((score / questions.length) * 100)}%）</p>
          {quiz.settings.showTimer && <p className="text-lg mb-2 text-gray-700 dark:text-gray-200">⏱️ 作答時間：{minutes} 分 {seconds} 秒</p>}
          <Button className="mt-4">📄 查看作答結果</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-mainBg dark:bg-gray-900">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">📝 {quiz?.title}</h1>
          {quiz?.deadline && <div className="text-sm text-gray-500 dark:text-gray-400">📆 截止：{quiz.deadline}</div>}
        </div>
        <div className="flex items-center gap-4 mt-4 sm:mt-0">
          {quiz?.settings?.showTimer && (
            <div className="px-4 py-2 bg-cardBg dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700">
              <div className="text-xl font-mono text-gray-700 dark:text-gray-200">⏱️ {timer}</div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            title={theme === 'light' ? '切換到深色模式' : '切換到亮色模式'}
            className="text-gray-700 dark:text-gray-300"
          >
            {theme === 'light' ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        {pagedQuestions.map((question, idx) => {
          if (!question.id) return null;
          return (
            <div key={question.id} className="bg-cardBg dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-300 dark:border-gray-700">
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
                {((page - 1) * QUESTIONS_PER_PAGE) + idx + 1}. {!['克漏字', '閱讀測驗'].includes(question.type) && question.content}
              </h2>

              {/* 閱讀測驗 */}
              {question.type === '閱讀測驗' && (
                <div className="space-y-6">
                  <div className="prose dark:prose-invert max-w-none mb-6 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                    {(question as ReadingQuestion).article}
                  </div>
                  <div className="space-y-8">
                    {(question as ReadingQuestion).questions.map((subQ, subIdx) => (
                      <div key={subQ.id} className="space-y-4">
                        <h3 className="text-base font-medium text-gray-800 dark:text-gray-200">
                          ({subIdx + 1}) {subQ.content}
                        </h3>
                        <div className="space-y-0.5 ml-4">
                          {subQ.options.map((option, optIdx) => (
                            <label key={option} className="flex items-start space-x-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 py-1.5 px-3 rounded-md transition-colors">
                              <input
                                type="radio"
                                name={`${question.id}_${subIdx}`}
                                value={option}
                                checked={Array.isArray(answersRef.current[question.id]) && answersRef.current[question.id][subIdx] === option}
                                onChange={() => {
                                  const currentAnswers = Array.isArray(answersRef.current[question.id]) ? [...answersRef.current[question.id]] : new Array((question as ReadingQuestion).questions.length).fill('');
                                  currentAnswers[subIdx] = option;
                                  handleAnswerChange(question.id, currentAnswers);
                                }}
                                className="radio text-primary mt-1"
                              />
                              <div className="flex-1">
                                <span className="font-medium mr-2">({String.fromCharCode(65 + optIdx)})</span>
                                <span className="break-words">{option}</span>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 克漏字 */}
              {question.type === '克漏字' && (
                <div className="space-y-6">
                  <div className="prose dark:prose-invert max-w-none mb-6 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                    {(question as ClozeQuestion).content}
                  </div>
                  <div className="space-y-4">
                    {(question as ClozeQuestion).questions.map((subQ, subIdx) => (
                      <div key={subIdx} className="flex items-start">
                        <span className="text-base font-medium text-gray-800 dark:text-gray-200 mr-4 pt-1.5">({subIdx + 1})</span>
                        <div className="space-y-0.5 flex-1">
                          {subQ.options.map((option, optIdx) => (
                            <label key={option} className="flex items-start space-x-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 py-1.5 px-3 rounded-md transition-colors">
                              <input
                                type="radio"
                                name={`${question.id}_${subIdx}`}
                                value={option}
                                checked={Array.isArray(answersRef.current[question.id]) && answersRef.current[question.id][subIdx] === option}
                                onChange={() => {
                                  const currentAnswers = Array.isArray(answersRef.current[question.id]) ? [...answersRef.current[question.id]] : new Array((question as ClozeQuestion).questions.length).fill('');
                                  currentAnswers[subIdx] = option;
                                  handleAnswerChange(question.id, currentAnswers);
                                }}
                                className="radio text-primary mt-1"
                              />
                              <div className="flex-1">
                                <span className="font-medium mr-2">({String.fromCharCode(65 + optIdx)})</span>
                                <span className="break-words">{option}</span>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 其他題型保持不變 */}
              {question.type === '單選題' && (
                <div className="space-y-0.5">
                  {(question as SingleChoiceQuestion).options.map((option, optIdx) => (
                    <label key={option} className="flex items-start space-x-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 py-1.5 px-3 rounded-md transition-colors">
                      <input
                        type="radio"
                        name={question.id}
                        value={option}
                        checked={answersRef.current[question.id] === option}
                        onChange={() => handleAnswerChange(question.id, option)}
                        className="radio text-primary mt-1"
                      />
                      <div className="flex-1">
                        <span className="font-medium mr-2">({String.fromCharCode(65 + optIdx)})</span>
                        <span className="break-words">{option}</span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              {question.type === '多選題' && (
                <div className="space-y-0.5">
                  {(question as MultipleChoiceQuestion).options.map((option, optIdx) => (
                    <label key={option} className="flex items-start space-x-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 py-1.5 px-3 rounded-md transition-colors">
                      <input
                        type="checkbox"
                        value={option}
                        checked={Array.isArray(answersRef.current[question.id]) && answersRef.current[question.id].includes(option)}
                        onChange={e => {
                          const currentAnswers = (answersRef.current[question.id] as string[]) || [];
                          const newAnswers = e.target.checked
                            ? [...currentAnswers, option]
                            : currentAnswers.filter(a => a !== option);
                          handleAnswerChange(question.id, newAnswers);
                        }}
                        className="checkbox text-primary mt-1"
                      />
                      <div className="flex-1">
                        <span className="font-medium mr-2">({String.fromCharCode(65 + optIdx)})</span>
                        <span className="break-words">{option}</span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              {question.type === '填空題' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {question.blanks?.map((_, i) => (
                      <Input
                        key={i}
                        className="w-40 bg-white dark:bg-gray-900 border-gray-300 placeholder:text-gray-400 dark:placeholder:text-gray-400 dark:border-gray-700 text-gray-900 dark:text-mainBg"
                        placeholder={`填空 ${i + 1}`}
                        value={(answersRef.current[question.id] as string[] | undefined)?.[i] || ''}
                        onChange={(e) => {
                          const currentAnswers = (answersRef.current[question.id] as string[]) || [];
                          const updatedAnswers = [...currentAnswers];
                          updatedAnswers[i] = e.target.value;
                          handleAnswerChange(question.id, updatedAnswers);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
              {question.type === '簡答題' && (
                <div className="mt-4">
                  <Textarea
                    value={answersRef.current[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    placeholder="請輸入你的答案"
                    className="w-full min-h-[120px] bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 分頁控制區 */}
      <div className="flex justify-between items-center mt-8">
        <Button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          variant="outline"
          className="dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-700"
        >
          ◀ 上一頁
        </Button>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          第 {page} / {totalPages} 頁　|　已完成 {completedCount} / {questions.length} 題
        </div>
        <Button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
          variant="outline"
          className="dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-700"
        >
          下一頁 ▶
        </Button>
      </div>

      <div className="mt-8">
        <Button
          onClick={handleSubmit}
          disabled={submitting || completedCount !== questions.length}
          className="w-full bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90"
        >
          {submitting ? '提交中...' : '📤 完成'}
        </Button>
      </div>
    </div>
  );
} 
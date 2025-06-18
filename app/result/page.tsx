"use client";

import { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/app/components/ui/tabs';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import Navigation from '@/app/components/Navigation';
import { 
  Target, 
  Search,
  ChevronLeft,
  BarChart3,
  PieChart,
  LineChart,
  FileSpreadsheet,
  SortDesc,
  Trash2
} from 'lucide-react';
import StudentAnswerDetail from '@/app/components/result/StudentAnswerDetail';
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import { Label } from "@/app/components/ui/label";
import { 
  doc, 
  getDoc, 
  collection, 
  getDocs, 
  Timestamp, 
  query, 
  orderBy, 
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Question } from '@/app/types/question';
import { toast } from 'sonner';
import ConfirmDeleteModal from '@/app/components/modals/ConfirmDeleteModal';

// 類型定義
type RecordType = 'assignment' | 'practice';

interface Quiz {
  id: string;
  title: string;
  description?: string;
  createdAt: Timestamp;
  questionIds: string[];
  useTargetList?: boolean;
  targetList?: string[];
  hasAssignResponses: boolean;
  hasPracticeResponses: boolean;
  averageScore?: number;
  practiceTime?: number;
  correctQuestions?: number;
  totalQuestions?: number;
  wrongQuestions?: number;
}

interface QuizResponse {
  id: string;
  name: string;
  answers: Record<string, string | string[]>;
  score: number;
  duration: string;
  submittedAt: Timestamp;
  submitTime: string;
  mode: RecordType;
  totalQuestions: number;
  wrongQuestions: number;
  percentage: number;
}

interface QuizResult {
  id: string;
  title: string;
  date: string;
  type: RecordType;
  className?: string;
  studentCount?: number;
  averageScore?: number;
  score?: number;
  totalQuestions?: number;
  duration?: string;
}

interface QuizData {
  quiz: Quiz;
  assignResults: QuizResponse[];
  practiceResults: QuizResponse[];
  questions: string[];
}

type Student = QuizResponse;

const isAssignment = (type: RecordType): boolean => type === 'assignment';
const isPractice = (type: RecordType): boolean => type === 'practice';

export default function ResultPage() {
  const [recordType, setRecordType] = useState<RecordType>('assignment');
  const [selectedQuiz, setSelectedQuiz] = useState<QuizResult | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [deleteQuizId, setDeleteQuizId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // 載入測驗資料
  const loadQuizData = async (quizId: string) => {
    try {
      setLoading(true);
      const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
      if (!quizDoc.exists()) {
        toast.error('測驗不存在');
        return;
      }

      const quizData = { id: quizDoc.id, ...quizDoc.data() } as Quiz;
      
      // 根據記錄類型載入對應的回應
      const responsesRef = collection(db, recordType === 'practice' ? 'practiceResponses' : 'quizResponses', quizId, 'responses');
      const responsesSnapshot = await getDocs(responsesRef);
      
      if (isPractice(recordType)) {
        // 自我練習模式
        const practiceData = responsesSnapshot.docs[0]?.data();
        if (practiceData) {
          const totalQuestions = quizData.questionIds.length;
          const wrongQuestions = Math.min(Math.abs(practiceData.score || 0), totalQuestions);
          const correctAnswers = totalQuestions - wrongQuestions;
          const percentage = Math.round((correctAnswers / totalQuestions) * 100);

          // 建立 QuizResult 物件
          const quizResult: QuizResult = {
            id: quizData.id,
            title: quizData.title,
            date: quizData.createdAt.toDate().toLocaleString('zh-TW', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }),
            type: 'practice',
            className: '自我練習',
            studentCount: 1,
            averageScore: percentage,
            score: correctAnswers,
            totalQuestions,
            duration: formatDuration(practiceData.timeTaken || 0)
          };
          setSelectedQuiz(quizResult);

          // 設定 QuizData
          const newQuizData: QuizData = {
            quiz: quizData,
            assignResults: [{
              id: responsesSnapshot.docs[0].id,
              name: '自我練習',
              answers: practiceData.answers || {},
              score: correctAnswers,
              duration: formatDuration(practiceData.timeTaken || 0),
              submittedAt: practiceData.submittedAt,
              submitTime: practiceData.submittedAt?.toDate().toLocaleString('zh-TW', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              }) || '',
              percentage,
              mode: 'practice',
              totalQuestions,
              wrongQuestions
            }],
            practiceResults: [],
            questions: quizData.questionIds
          };
          setQuizData(newQuizData);
        }
      } else {
        // 派送作業模式
        const responses = responsesSnapshot.docs.map(doc => {
          const data = doc.data();
          const totalQuestions = quizData.questionIds.length;
          const wrongQuestions = Math.min(Math.abs(data.score || 0), totalQuestions);
          const correctAnswers = totalQuestions - wrongQuestions;
          return Math.round((correctAnswers / totalQuestions) * 100);
        });
        
        const averageScore = responses.length > 0
          ? Math.round(responses.reduce((sum, score) => sum + score, 0) / responses.length)
          : 0;

        // 建立 QuizResult 物件
        const quizResult: QuizResult = {
          id: quizData.id,
          title: quizData.title,
          date: quizData.createdAt.toDate().toLocaleString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }),
          type: 'assignment',
          className: quizData.useTargetList && Array.isArray(quizData.targetList) && quizData.targetList.length > 0
            ? `${quizData.targetList[0]}等${quizData.targetList.length}人`
            : '不指定',
          studentCount: responses.length,
          averageScore
        };
        setSelectedQuiz(quizResult);

        // 設定 QuizData
        const newQuizData: QuizData = {
          quiz: quizData,
          assignResults: responsesSnapshot.docs.map(doc => {
            const data = doc.data();
            const totalQuestions = quizData.questionIds.length;
            const wrongQuestions = Math.min(Math.abs(data.score || 0), totalQuestions);
            const correctAnswers = totalQuestions - wrongQuestions;
            const percentage = Math.round((correctAnswers / totalQuestions) * 100);
            return {
              id: doc.id,
              name: data.name || '',
              answers: data.answers || {},
              score: correctAnswers,
              duration: formatDuration(data.timeTaken || 0),
              submittedAt: data.submittedAt,
              submitTime: data.submittedAt?.toDate().toLocaleString('zh-TW', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              }) || '',
              percentage,
              mode: 'assignment',
              totalQuestions,
              wrongQuestions
            } as QuizResponse;
          }),
          practiceResults: [],
          questions: quizData.questionIds
        };
        setQuizData(newQuizData);
      }
    } catch (error) {
      console.error('載入測驗資料失敗:', error);
      toast.error('載入測驗資料失敗');
    } finally {
      setLoading(false);
    }
  };

  // 首次載入測驗列表
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        
        const quizzesRef = collection(db, 'quizzes');
        const q = query(quizzesRef, orderBy('createdAt', 'desc'));
        const quizzesSnapshot = await getDocs(q);
        
        const quizPromises = quizzesSnapshot.docs.map(async (quizDoc) => {
          const quiz = { id: quizDoc.id, ...quizDoc.data() } as Quiz;
          const totalQuestions = quiz.questionIds?.length || 0;
          
          const [assignResponsesSnapshot, practiceResponsesSnapshot] = await Promise.all([
            getDocs(collection(db, 'quizResponses', quiz.id, 'responses')),
            getDocs(collection(db, 'practiceResponses', quiz.id, 'responses'))
          ]);

          // 計算派送作業的平均答對率
          const assignResponses = assignResponsesSnapshot.docs.map(doc => {
            const data = doc.data();
            const wrongQuestions = Math.min(Math.abs(data.score || 0), totalQuestions);
            const correctAnswers = totalQuestions - wrongQuestions;
            return Math.round((correctAnswers / totalQuestions) * 100);
          });

          const averageScore = assignResponses.length > 0
            ? Math.round(assignResponses.reduce((sum, score) => sum + score, 0) / assignResponses.length)
            : 0;

          // 取得自我練習的答對率和作答時間
          let practiceScore = 0;
          let practiceTime = 0;
          let correctQuestions = 0;
          let wrongQuestions = 0;

          if (practiceResponsesSnapshot.size > 0) {
            const practiceData = practiceResponsesSnapshot.docs[0].data();
            wrongQuestions = Math.min(Math.abs(practiceData.score || 0), totalQuestions);
            correctQuestions = totalQuestions - wrongQuestions;
            practiceScore = totalQuestions > 0 ? Math.round((correctQuestions / totalQuestions) * 100) : 0;
            // 將毫秒轉換為秒
            practiceTime = Math.floor((practiceData.duration || 0) / 1000);
          }

          return {
            ...quiz,
            hasAssignResponses: assignResponsesSnapshot.size > 0,
            hasPracticeResponses: practiceResponsesSnapshot.size > 0,
            averageScore: recordType === 'practice' ? practiceScore : averageScore,
            practiceTime,
            correctQuestions,
            totalQuestions,
            wrongQuestions
          };
        });

        const quizList = await Promise.all(quizPromises);
        setQuizzes(quizList);

        // 根據記錄類型過濾測驗
        const filteredList = quizList.filter(quiz => 
          recordType === 'practice' ? quiz.hasPracticeResponses : quiz.hasAssignResponses
        );

        // 如果有符合的測驗，自動選擇第一個
        if (filteredList.length > 0) {
          await loadQuizData(filteredList[0].id);
        }
      } catch (error) {
        console.error('載入測驗列表失敗:', error);
        toast.error('載入測驗列表失敗');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [recordType]);

  // 根據記錄類型過濾測驗列表
  const filteredQuizzes = useMemo(() => {
    if (!quizzes) return [];
    
    return quizzes.filter(quiz => 
      recordType === 'practice' ? quiz.hasPracticeResponses : quiz.hasAssignResponses
    );
  }, [quizzes, recordType]);

  // 切換記錄類型時重新載入資料
  useEffect(() => {
    if (selectedQuiz) {
      loadQuizData(selectedQuiz.id);
    }
  }, [recordType]);

  // 格式化時間函數
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  // 刪除測驗記錄
  const handleDeleteQuiz = async () => {
    if (!deleteQuizId) return;

    try {
      setLoading(true);
      const quizToDelete = quizzes.find(q => q.id === deleteQuizId);
      
      if (!quizToDelete) {
        toast.error('找不到要刪除的測驗');
        return;
      }

      // 1. 刪除回應集合中的所有文件
      const collectionPath = isPractice(recordType) ? 'practiceResponses' : 'quizResponses';
      const responsesRef = collection(db, collectionPath, deleteQuizId, 'responses');
      const responsesSnapshot = await getDocs(responsesRef);
      
      // 使用批次處理來刪除文件
      const batch = writeBatch(db);
      
      // 添加所有回應文件到批次處理中
      responsesSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      // 執行批次刪除
      await batch.commit();

      // 2. 更新本地狀態
      setQuizzes(prev => prev.filter(quiz => quiz.id !== deleteQuizId));
      if (selectedQuiz?.id === deleteQuizId) {
        setSelectedQuiz(null);
        setQuizData(null);
      }

      toast.success('測驗記錄已刪除');
    } catch (error) {
      console.error('刪除測驗記錄失敗:', error);
      toast.error('刪除測驗記錄失敗');
    } finally {
      setLoading(false);
      setDeleteQuizId(null);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col bg-mainBg dark:bg-gray-900">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-lg">載入中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-mainBg dark:bg-gray-900">
      <Navigation />
      <div className="flex h-[calc(100vh-4rem)]">
        {/* 左側記錄瀏覽區 */}
        <div className="w-2/5 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
          <div className="space-y-4">
            {/* 顯示類型選擇 */}
            <div className="bg-transparent dark:bg-gray-800 rounded-lg p-4 shadow">
              <h3 className="text-lg font-semibold mb-3">📂 顯示紀錄類型</h3>
              <RadioGroup 
                defaultValue="assignment"
                value={recordType}
                onValueChange={(value) => setRecordType(value as RecordType)}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="assignment" id="assignment" />
                  <Label htmlFor="assignment">派送作業</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="practice" id="practice" />
                  <Label htmlFor="practice">自我練習</Label>
                </div>
              </RadioGroup>
            </div>

            {/* 記錄列表 */}
            <div className="space-y-2">
              {filteredQuizzes.map(quiz => (
                <Card
                  key={quiz.id}
                  className={`relative p-4 bg-cardBg dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl shadow-lg ${
                    selectedQuiz?.id === quiz.id ? 'border-primary' : ''
                  }`}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 p-1 h-auto bg-transparent hover:bg-transparent text-gray-400 hover:text-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteQuizId(quiz.id);
                      setShowDeleteModal(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <div 
                    className="space-y-2 cursor-pointer"
                    onClick={() => loadQuizData(quiz.id)}
                  >
                    <div className="font-medium pr-8">📃 {quiz.title || `試卷 ${quiz.id}`}</div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <span>📅 {quiz.createdAt.toDate().toLocaleString('zh-TW', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                      })}</span>
                      {recordType === 'practice' ? (
                        <>
                          <span>🎯 {quiz.correctQuestions || 0}/{quiz.totalQuestions || 0}(-{quiz.wrongQuestions || 0}, {quiz.averageScore || 0}%)</span>
                          <span>⏱{formatDuration(quiz.practiceTime || 0)}</span>
                        </>
                      ) : (
                        <>
                          <span>👩‍🏫 {quiz.useTargetList && Array.isArray(quiz.targetList) && quiz.targetList.length > 0
                            ? `${quiz.targetList[0]}等${quiz.targetList.length}人`
                            : '不指定'}</span>
                          <span>🎯 {quiz.averageScore || 0}%</span>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
              {filteredQuizzes.length === 0 && (
                <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                  {recordType === 'practice' ? '沒有自我練習記錄' : '沒有派送作業記錄'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 右側答題分析區 */}
        <div className="w-3/5 p-4 overflow-y-auto">
          {selectedQuiz && quizData ? (
            <div className="space-y-4">
              {isPractice(recordType) ? (
                <StudentAnswerDetail
                  studentName="自我練習"
                  answers={quizData.assignResults[0]?.answers || {}}
                  questionIds={quizData.questions}
                  onBack={() => {}}
                  isPractice={true}
                />
              ) : (
                !selectedStudent ? (
                  <>
                    {/* 標頭區 */}
                    <Card className="p-4 bg-cardBg dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl shadow-lg">
                      <div className="space-y-2">
                        <h2 className="text-xl font-semibold">📃 {selectedQuiz.title}</h2>
                        <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center space-x-2">
                            <span>📅</span>
                            <span>派送時間：{selectedQuiz.date}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span>👩‍🏫</span>
                            <span>{selectedQuiz.className} ({selectedQuiz.studentCount}人)</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span>🎯</span>
                            <span>平均答對率：{selectedQuiz.averageScore}%</span>
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* 學生列表 */}
                    <Card className="p-4 bg-cardBg dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl shadow-lg">
                      <div className="space-y-3">
                        {quizData.assignResults.map((student) => (
                          <div
                            key={student.id}
                            className="flex items-center justify-between p-2 rounded-lg"
                          >
                            <div className="flex items-center space-x-4">
                              <span>🙋‍♂️ {student.name}</span>
                              <span>🎯 {student.score}/{student.totalQuestions}(-{student.wrongQuestions}, {student.percentage}%)</span>
                              <span className="text-gray-600 dark:text-gray-400">
                                <span>📅 {student.submitTime}</span>
                              </span>
                              <span className="text-gray-600 dark:text-gray-400">
                                <span>⏱️ {student.duration}</span>
                              </span>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="bg-transparent hover:bg-transparent text-gray-300 hover:text-gray-500 dark:hover:text-gray-400 p-0 h-auto shadow-none"
                              onClick={() => setSelectedStudent(student)}
                            >
                              🔍
                            </Button>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </>
                ) : (
                  <StudentAnswerDetail
                    studentName={selectedStudent.name}
                    answers={selectedStudent.answers}
                    questionIds={quizData.questions}
                    onBack={() => setSelectedStudent(null)}
                    isPractice={false}
                  />
                )
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              請從左側選擇一個測驗記錄以查看詳細資訊
            </div>
          )}
        </div>
      </div>

      {/* 刪除確認對話框 */}
      <ConfirmDeleteModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onConfirm={handleDeleteQuiz}
      />
    </div>
  );
} 
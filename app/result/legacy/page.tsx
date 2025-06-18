'use client';

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
  SortDesc
} from 'lucide-react';
import StudentAnswerDetail from '@/app/components/result/StudentAnswerDetail';
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import { Label } from "@/app/components/ui/label";
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { doc, getDoc, collection, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Question } from '@/app/types/question';

// 類型定義
type RecordType = 'assignment' | 'practice';
type DisplayMode = 'students' | 'questions' | 'trends';
type SortBy = 'name' | 'submitTime' | 'score' | 'duration';

interface Quiz {
  id: string;
  title: string;
  useTargetList: boolean;
  targetList: string[];
  questions: Question[];
  createdAt: Timestamp;
}

interface QuizResponse {
  id: string;
  name: string;
  answers: Record<string, string | string[]>;
  score: number;
  duration: string;
  submittedAt: Timestamp;
  submitTime: string;
  mode: 'assign' | 'practice';
  totalQuestions: number;
  wrongQuestions: number;
  percentage: number;
}

interface QuizResult {
  id: string;
  title: string;
  date: string;
  type: RecordType;
  // 派送作業特有
  className?: string;
  studentCount?: number;
  averageScore?: number;
  // 自我練習特有
  score?: number;
  totalQuestions?: number;
  duration?: string;
}

type Student = QuizResponse;

export default function ResultPage() {
  const params = useParams();
  const quizId = params?.quizId as string;
  const [recordType, setRecordType] = useState<RecordType>('assignment');
  const [selectedQuiz, setSelectedQuiz] = useState<QuizResult | null>(null);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('students');
  const [sortBy, setSortBy] = useState<SortBy>('score');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [quizData, setQuizData] = useState<{
    quiz: Quiz;
    assignResults: QuizResponse[];
    practiceResults: QuizResponse[];
    questions: Question[];
  } | null>(null);

  // 載入測驗結果
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
        quizData.id = quizDoc.id;
        console.log('試卷資料:', quizData);

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

        const processResponse = (doc: any, mode: 'assign' | 'practice'): QuizResponse => {
          const data = doc.data();
          const totalQuestions = quizData.questions.length;
          const submitTime = data.submittedAt.toDate().toLocaleString();
          const duration = `${Math.floor(data.duration / 60000)}:${Math.floor((data.duration % 60000) / 1000)}`;
          
          return {
            id: doc.id,
            ...data,
            mode,
            totalQuestions,
            wrongQuestions: totalQuestions - data.score,
            percentage: Math.round((data.score / totalQuestions) * 100),
            duration,
            submitTime
          };
        };

        const assignResults = assignResponsesSnapshot.docs.map(doc => processResponse(doc, 'assign'));
        const practiceResults = practiceResponsesSnapshot.docs.map(doc => processResponse(doc, 'practice'));

        console.log('指派作答紀錄:', assignResults);
        console.log('練習作答紀錄:', practiceResults);

        setQuizData({
          quiz: quizData,
          assignResults,
          practiceResults,
          questions: quizData.questions
        });

        // 設定選中的測驗
        const quizResult: QuizResult = {
          id: quizData.id,
          title: quizData.title,
          date: quizData.createdAt.toDate().toLocaleString(),
          type: 'assignment',
          className: quizData.useTargetList ? '指定學生' : '開放作答',
          studentCount: assignResults.length,
          averageScore: assignResults.length > 0 
            ? Math.round(
                assignResults.reduce((sum, r) => sum + r.percentage, 0) / assignResults.length
              )
            : 0
        };
        console.log('處理後的測驗結果:', quizResult);
        setSelectedQuiz(quizResult);
      } catch (error) {
        console.error('載入資料失敗:', error);
        toast.error('載入資料失敗');
      } finally {
        setLoading(false);
      }
    };

    if (quizId) {
      fetchData();
    }
  }, [quizId]);

  // 根據排序方式排序學生列表
  const sortedStudents = useMemo(() => {
    console.log('排序學生列表:', {
      recordType,
      quizData,
      assignResults: quizData?.assignResults,
      practiceResults: quizData?.practiceResults
    });

    if (!quizData) return [];

    const students = recordType === 'assignment' ? quizData.assignResults : quizData.practiceResults;
    return [...students].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name, 'zh-TW');
        case 'score':
          return b.percentage - a.percentage;
        case 'submitTime':
          return new Date(a.submitTime).getTime() - new Date(b.submitTime).getTime();
        case 'duration':
          const [aH, aM, aS] = a.duration.split(':').map(Number);
          const [bH, bM, bS] = b.duration.split(':').map(Number);
          const aDuration = aH * 3600 + aM * 60 + aS;
          const bDuration = bH * 3600 + bM * 60 + bS;
          return aDuration - bDuration;
        default:
          return 0;
      }
    });
  }, [quizData, recordType, sortBy]);

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
              {selectedQuiz && (
                <Card
                  key={selectedQuiz.id}
                  className={`p-4 cursor-pointer bg-cardBg dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl shadow-lg border-primary`}
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span>📅</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{selectedQuiz.date}</span>
                      </div>
                      <div className="font-medium">📃 {selectedQuiz.title}</div>
                      {selectedQuiz.type === 'assignment' ? (
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                          <span>👥</span>
                          <span>{selectedQuiz.className} ({selectedQuiz.studentCount}人)</span>
                          <span className="ml-2">🎯</span>
                          <span>{selectedQuiz.averageScore}%</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                          <span>🎯</span>
                          <span>{selectedQuiz.score}/{selectedQuiz.totalQuestions} 題</span>
                          <span className="ml-2">⏱️</span>
                          <span>{selectedQuiz.duration}</span>
                        </div>
                      )}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="bg-transparent hover:bg-transparent text-gray-300 hover:text-gray-500 dark:hover:text-gray-400 p-0 h-auto shadow-none"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (recordType === 'practice' && quizData?.practiceResults[0]) {
                          // 自我練習直接顯示詳細作答記錄
                          setSelectedStudent(quizData.practiceResults[0]);
                        } else {
                          // 派送作業只開啟答題分析區
                          setSelectedStudent(null);
                        }
                      }}
                    >
                      🔍
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* 右側答題分析區 */}
        <div className="w-3/5 p-4 overflow-y-auto">
                    {selectedQuiz && quizData ? (
            <div className="space-y-4">
              {!selectedStudent ? (
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
                          <span>👥</span>
                          <span>
                            作答人數：
                            {selectedQuiz.type === 'assignment'
                              ? `${selectedQuiz.className} (${selectedQuiz.studentCount}人)`
                              : '自己'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span>🎯</span>
                          <span>
                            平均答對率：
                            {selectedQuiz.type === 'assignment'
                              ? `${selectedQuiz.averageScore}%`
                              : `${selectedQuiz.score}/${selectedQuiz.totalQuestions}題`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 顯示模式選擇 */}
                    <div className="mt-4 space-y-4">
                      <RadioGroup 
                        defaultValue="students"
                        value={displayMode}
                        onValueChange={(value) => setDisplayMode(value as DisplayMode)}
                        className="flex gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="students" id="students" />
                          <Label htmlFor="students">學生列表</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="questions" id="questions" />
                          <Label htmlFor="questions">題目分析</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="trends" id="trends" />
                          <Label htmlFor="trends">個人趨勢</Label>
                        </div>
                      </RadioGroup>

                      {/* 排序選項（僅在學生列表模式顯示） */}
                      {displayMode === 'students' && (
                        <div className="flex items-center space-x-2 mt-4">
                          <SortDesc className="h-4 w-4" />
                          <span className="text-sm mr-2">排序學生：</span>
                          <RadioGroup 
                            defaultValue="score"
                            value={sortBy}
                            onValueChange={(value) => setSortBy(value as SortBy)}
                            className="flex gap-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="name" id="sort-name" />
                              <Label htmlFor="sort-name">姓名</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="score" id="sort-score" />
                              <Label htmlFor="sort-score">答對率</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="submitTime" id="sort-time" />
                              <Label htmlFor="sort-time">繳交時間</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="duration" id="sort-duration" />
                              <Label htmlFor="sort-duration">用時</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* 內容區域 */}
                  <div className="space-y-4">
                    {displayMode === 'students' && (
                      <div className="space-y-2">
                        {/* 學生列表 */}
                        <Card className="p-4 bg-cardBg dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl shadow-lg">
                          <div className="space-y-3">
                            {sortedStudents.map((student) => (
                              <div
                                key={student.id}
                                className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
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
                      </div>
                    )}

                    {displayMode === 'questions' && (
                      <div className="space-y-4">
                        <Card className="p-4">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">📊 題目答對率分析</h3>
                            <Button variant="outline" size="sm">
                              <FileSpreadsheet className="h-4 w-4 mr-2" />
                              匯出 Excel
                            </Button>
                          </div>
                          <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                            <span className="text-gray-500">長條圖區域</span>
                          </div>
                        </Card>
                        <Card className="p-4">
                          <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                            <span className="text-gray-500">圓餅圖區域</span>
                          </div>
                        </Card>
                      </div>
                    )}

                    {displayMode === 'trends' && (
                      <Card className="p-4">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold">📈 答對率趨勢</h3>
                          {selectedQuiz.type === 'assignment' && (
                            <Button variant="outline">
                              選擇學生 ⏷
                            </Button>
                          )}
                        </div>
                        <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <span className="text-gray-500">折線圖區域</span>
                        </div>
                      </Card>
                    )}
                  </div>
                </>
              ) : (
                <StudentAnswerDetail
                  studentName={selectedStudent.name}
                  answers={selectedStudent.answers}
                  questionIds={quizData.questions.map(q => q.id)}
                  onBack={() => setSelectedStudent(null)}
                  isPractice={recordType === 'practice'}
                />
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              請從左側選擇一個測驗記錄以查看詳細資訊
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
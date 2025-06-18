import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { ChevronLeft, ChevronDown, ChevronRight } from 'lucide-react';
import { 
  Question, 
  ReadingQuestion, 
  ClozeQuestion, 
  SingleChoiceQuestion,
  MultipleChoiceQuestion
} from '@/app/types/question';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface StudentAnswerDetailProps {
  studentName: string;
  answers: Record<string, string | string[]>;
  questionIds: string[];
  onBack: () => void;
  isPractice: boolean;
}

export default function StudentAnswerDetail({
  studentName,
  answers,
  questionIds,
  onBack,
  isPractice
}: StudentAnswerDetailProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const loadedQuestions = await Promise.all(
          questionIds.map(async (id) => {
            const questionDoc = await getDoc(doc(db, 'questions', id));
            if (!questionDoc.exists()) {
              console.error(`找不到題目: ${id}`);
              return null;
            }
            return { ...questionDoc.data(), id: questionDoc.id } as Question;
          })
        );
        setQuestions(loadedQuestions.filter((q): q is Question => q !== null));
      } catch (error) {
        console.error('載入題目失敗:', error);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [questionIds]);

  // 檢查題目類型的輔助函數
  const isSingleChoice = (q: Question): q is SingleChoiceQuestion => q.type === '單選題';
  const isMultipleChoice = (q: Question): q is MultipleChoiceQuestion => q.type === '多選題';
  const isReadingQuestion = (q: Question): q is ReadingQuestion => q.type === '閱讀測驗';
  const isClozeQuestion = (q: Question): q is ClozeQuestion => q.type === '克漏字';

  // 檢查答案是否正確的輔助函數
  const checkAnswer = (question: Question, userAnswer: string | string[] | undefined): boolean => {
    if (!userAnswer) return false;

    if (isSingleChoice(question)) {
      return userAnswer === question.options[question.answer];
    } else if (isMultipleChoice(question)) {
      const correctAnswers = question.answers.map(idx => question.options[idx]);
      return Array.isArray(userAnswer) &&
             userAnswer.length === correctAnswers.length &&
             userAnswer.every(a => correctAnswers.includes(a));
    } else if (isReadingQuestion(question)) {
      return Array.isArray(userAnswer) &&
             question.questions.every((q, i) => 
               userAnswer[i] === q.options[parseInt(q.answer)]
             );
    } else if (isClozeQuestion(question)) {
      return Array.isArray(userAnswer) &&
             question.questions.every((q, i) => 
               userAnswer[i] === q.options[q.answer]
             );
    }
    return false;
  };

  // 獲取正確答案的輔助函數
  const getCorrectAnswer = (question: Question): string => {
    if (isSingleChoice(question)) {
      return question.options[question.answer];
    } else if (isMultipleChoice(question)) {
      return question.answers.map(idx => question.options[idx]).join('、');
    } else if (isReadingQuestion(question)) {
      return question.questions.map((q, i) => 
        `${i + 1}. ${q.options[parseInt(q.answer)]}`
      ).join('\n');
    } else if (isClozeQuestion(question)) {
      return question.questions.map((q, i) => 
        `${i + 1}. ${q.options[q.answer]}`
      ).join('\n');
    }
    return '';
  };

  // 切換題目展開/折疊狀態
  const toggleQuestion = (questionId: string) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">載入題目中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 標頭區 */}
      <Card className="p-4 bg-cardBg dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {!isPractice && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="bg-trasparent"
              >
                
                ⬅
              </Button>
            )}
            <h2 className="text-xl font-semibold">🙋‍♂️ {studentName} 的作答記錄</h2>
          </div>
        </div>
      </Card>

      {/* 答題記錄 */}
      <div className="space-y-4">
        {questions.map((question, index) => {
          const userAnswer = answers[question.id];
          const isCorrect = checkAnswer(question, userAnswer);
          const isExpanded = expandedQuestions[question.id];

          return (
            <Card
              key={question.id}
              className={`p-4 bg-cardBg dark:bg-gray-800 border ${
                isCorrect ? 'border-green-500' : 'border-red-500'
              } rounded-xl shadow-lg cursor-pointer transition-all duration-200`}
              onClick={() => toggleQuestion(question.id)}
            >
              {/* 題目標頭 - 永遠顯示 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="font-semibold">第 {index + 1} 題</span>
                  <span className={`text-sm ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                    {isCorrect ? '✅ 答對' : '❌ 答錯'}
                  </span>
                  <span className="text-sm text-gray-500">{question.type}</span>
                </div>
                <ChevronDown 
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isExpanded ? 'transform rotate-180' : ''
                  }`}
                />
              </div>

              {/* 展開的內容 */}
              {isExpanded && (
                <div className="mt-4 space-y-4">
                  {/* 題目內容 */}
                  <div className="space-y-2">
                    {isReadingQuestion(question) ? (
                      <>
                        <div className="whitespace-pre-wrap">{question.article}</div>
                        {question.questions.map((subQ, subIndex) => (
                          <div key={subIndex} className="ml-4 mt-2">
                            <div className="font-medium">{subQ.content}</div>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              {subQ.options.map((option, optIndex) => (
                                <div
                                  key={optIndex}
                                  className={`p-2 rounded ${
                                    Array.isArray(userAnswer) && userAnswer[subIndex] === option
                                      ? isCorrect
                                        ? 'bg-green-100 dark:bg-green-900'
                                        : 'bg-red-100 dark:bg-red-900'
                                      : 'bg-gray-50 dark:bg-gray-800'
                                  }`}
                                >
                                  {option}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </>
                    ) : isClozeQuestion(question) ? (
                      <>
                        <div className="whitespace-pre-wrap">{question.content}</div>
                        {question.questions.map((subQ, subIndex) => (
                          <div key={subIndex} className="ml-4 mt-2">
                            <div className="font-medium">空格 {subIndex + 1}</div>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              {subQ.options.map((option, optIndex) => (
                                <div
                                  key={optIndex}
                                  className={`p-2 rounded ${
                                    Array.isArray(userAnswer) && userAnswer[subIndex] === option
                                      ? isCorrect
                                        ? 'bg-green-100 dark:bg-green-900'
                                        : 'bg-red-100 dark:bg-red-900'
                                      : 'bg-gray-50 dark:bg-gray-800'
                                  }`}
                                >
                                  {option}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <>
                        <div className="whitespace-pre-wrap">{question.content}</div>
                        {(isSingleChoice(question) || isMultipleChoice(question)) && (
                          <div className="grid grid-cols-2 gap-2">
                            {question.options.map((option, optIndex) => (
                              <div
                                key={optIndex}
                                className={`p-2 rounded ${
                                  isSingleChoice(question)
                                    ? userAnswer === option
                                      ? isCorrect
                                        ? 'bg-green-100 dark:bg-green-900'
                                        : 'bg-red-100 dark:bg-red-900'
                                      : 'bg-gray-50 dark:bg-gray-800'
                                    : Array.isArray(userAnswer) && userAnswer.includes(option)
                                    ? isCorrect
                                      ? 'bg-green-100 dark:bg-green-900'
                                      : 'bg-red-100 dark:bg-red-900'
                                    : 'bg-gray-50 dark:bg-gray-800'
                                }`}
                              >
                                {option}
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* 答案與解釋 */}
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">正確答案：</span>
                      <span className="text-green-600 dark:text-green-400 whitespace-pre-line">
                        {getCorrectAnswer(question)}
                      </span>
                    </div>
                    {question.explanation && (
                      <div>
                        <span className="font-medium">解釋：</span>
                        <span className="text-gray-600 dark:text-gray-400">{question.explanation}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
} 
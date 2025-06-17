import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Question } from '@/app/types/question';
import type { 
  SingleChoiceQuestion,
  FillInQuestion,
  ShortAnswerQuestion,
  ReadingQuestion,
  ClozeQuestion,
  SubQuestion,
  ClozeSubQuestion,
  MultipleChoiceQuestion
} from '@/app/types/question';

interface QuestionCardsProps {
  questions: Question[];
  selectedQuestionIds: string[];
  collapsedCards: string[];
  onToggleCollapse: (id: string) => void;
  onToggleSelection: (id: string) => void;
  onEditClick: (question: Question) => void;
  MAX_ITEMS: number;
  isPremium: boolean;
}

// Type Guards
function isSingleChoiceQuestion(q: Question): q is SingleChoiceQuestion {
  return q.type === '單選題';
}

function isMultipleChoiceQuestion(q: Question): q is MultipleChoiceQuestion {
  return q.type === '多選題';
}

function isFillInQuestion(q: Question): q is FillInQuestion {
  return q.type === '填空題';
}

function isShortAnswerQuestion(q: Question): q is ShortAnswerQuestion {
  return q.type === '簡答題';
}

function isReadingQuestion(q: Question): q is ReadingQuestion {
  return q.type === '閱讀測驗';
}

function isClozeQuestion(q: Question): q is ClozeQuestion {
  return q.type === '克漏字';
}

export default function QuestionCards({
  questions,
  selectedQuestionIds,
  collapsedCards,
  onToggleCollapse,
  onToggleSelection,
  onEditClick,
  MAX_ITEMS,
  isPremium
}: QuestionCardsProps) {
  return (
    <div className="overflow-y-auto h-[calc(100vh-64px-72px-40px)] pr-2 space-y-4">
      {questions.length > MAX_ITEMS && (
        <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-lg mb-4">
          <p className="text-yellow-800 dark:text-yellow-200">
            {isPremium ? '您已達到付費版本的1000題上限' : '您已達到免費版本的100題上限。升級至付費版本可存放最多1000題！'}
          </p>
        </div>
      )}
      
      {questions.map((q: Question) => {
        if (!q.id) return null; // 如果沒有 id，跳過這個問題
        const isCollapsed = collapsedCards.includes(q.id);
        return (
          <div key={q.id} className="relative p-4 bg-cardBg dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl shadow-lg">
            <Button
              onClick={() => onEditClick(q)}
              className="absolute top-3 right-3 bg-transparent hover:bg-transparent text-gray-300 hover:text-gray-500 dark:hover:text-gray-400 p-0 h-auto shadow-none"
              title="編輯"
              variant="ghost"
            >
              ✏️
            </Button>
            <div className="flex-1">
              <div onClick={() => q.id && onToggleCollapse(q.id)} className="cursor-pointer">
                <div className="flex">
                  <div className="w-[24px]">
                    <Checkbox
                      checked={q.id ? selectedQuestionIds.includes(q.id) : false}
                      onCheckedChange={() => q.id && onToggleSelection(q.id)}
                      className="mt-[2px]"
                      onClick={e => e.stopPropagation()}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-700 dark:text-gray-400">
                      {q.type} ｜ {q.tags.join(', ')}
                    </div>
                    <div className={`font-medium mt-1 text-gray-800 dark:text-gray-300 ${isCollapsed ? 'line-clamp-1' : ''}`}>
                      1. {(() => {
                        if (isReadingQuestion(q)) return q.article;
                        if (isClozeQuestion(q)) {
                          return q.content;
                        }
                        if (isFillInQuestion(q)) {
                          return q.content.replace(/\[\[.*?\]\]/g, '_____');
                        }
                        return q.content;
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              {!isCollapsed && (
                <>
                  {isSingleChoiceQuestion(q) ? (
                    <>
                      <ul className="list-none pl-5 text-sm mt-1 text-gray-800 dark:text-gray-300 ml-6">
                        {q.options.map((opt: string, i: number) => (
                          <li key={i}>({String.fromCharCode(65 + i)}) {opt}</li>
                        ))}
                      </ul>
                      <div className="text-sm mt-1 text-gray-800 dark:text-gray-300 ml-6">
                        🟢 正解：({String.fromCharCode(65 + q.answer)}) {q.options[q.answer]}
                      </div>
                      {q.explanation && (
                        <div className="text-sm mt-1 text-gray-600 dark:text-gray-400 ml-6">
                          💡 解釋：{q.explanation}
                        </div>
                      )}
                    </>
                  ) : isMultipleChoiceQuestion(q) ? (
                    <>
                      <ul className="list-none pl-5 text-sm mt-1 text-gray-800 dark:text-gray-300 ml-6">
                        {q.options.map((opt: string, i: number) => (
                          <li key={i}>({String.fromCharCode(65 + i)}) {opt}</li>
                        ))}
                      </ul>
                      <div className="text-sm mt-1 text-gray-800 dark:text-gray-300 ml-6">
                        🟢 正解：
                        {q.answers
                          .sort((a, b) => a - b)
                          .map(index => `(${String.fromCharCode(65 + index)}) ${q.options[index]}`)
                          .join('、')}
                      </div>
                      {q.explanation && (
                        <div className="text-sm mt-1 text-gray-600 dark:text-gray-400 ml-6">
                          💡 解釋：{q.explanation}
                        </div>
                      )}
                    </>
                  ) : isFillInQuestion(q) ? (
                    <>
                      <div className="text-sm mt-1 text-gray-800 dark:text-gray-300 ml-6">
                        🟢 正解：{q.blanks.join('、')}
                      </div>
                      {q.explanation && (
                        <div className="text-sm mt-1 text-gray-600 dark:text-gray-400 ml-6">
                          💡 解釋：{q.explanation}
                        </div>
                      )}
                    </>
                  ) : isShortAnswerQuestion(q) ? (
                    <>
                      <div className="text-sm mt-1 text-gray-800 dark:text-gray-300 ml-6">
                        🟢 正解：{q.answer}
                      </div>
                      {q.explanation && (
                        <div className="text-sm mt-1 text-gray-600 dark:text-gray-400 ml-6">
                          💡 解釋：{q.explanation}
                        </div>
                      )}
                    </>
                  ) : isReadingQuestion(q) ? (
                    <>
                      <ul className="list-decimal pl-5 text-sm mt-2 text-gray-800 dark:text-gray-300 ml-6">
                        {q.questions.map((sub: SubQuestion) => (
                          <li key={sub.id || Math.random().toString()} className="mb-2">
                            {sub.content}
                            <ul className="list-none pl-5 mt-1">
                              {sub.options.map((opt: string, i: number) => (
                                <li key={i}>({String.fromCharCode(65 + i)}) {opt}</li>
                              ))}
                            </ul>
                            <div className="text-sm mt-1">
                              🟢 正解：({String.fromCharCode(65 + sub.options.indexOf(sub.answer))}) {sub.answer}
                            </div>
                            {sub.explanation && (
                              <div className="text-sm mt-1 text-gray-600 dark:text-gray-400">
                                💡 解釋：{sub.explanation}
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                      {q.explanation && (
                        <div className="text-sm mt-2 text-gray-600 dark:text-gray-400 ml-6">
                          💡 整體解釋：{q.explanation}
                        </div>
                      )}
                    </>
                  ) : isClozeQuestion(q) && (
                    <>
                      <ul className="list-decimal pl-5 text-sm mt-2 text-gray-800 dark:text-gray-300 ml-6">
                        {q.questions.map((sub, index: number) => (
                          <li key={`cloze-${index}`} className="mb-2">
                            <ul className="list-none pl-5">
                              {sub.options.map((opt: string, i: number) => (
                                <li key={i}>({String.fromCharCode(65 + i)}) {opt}</li>
                              ))}
                            </ul>
                            <div className="text-sm mt-1">
                              🟢 正解：({String.fromCharCode(65 + sub.answer)}) {sub.options[sub.answer]}
                            </div>
                            {sub.content && (
                              <div className="text-sm mt-1 text-gray-600 dark:text-gray-400">
                                💡 說明：{sub.content}
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                      {q.explanation && (
                        <div className="text-sm mt-2 text-gray-600 dark:text-gray-400 ml-6">
                          💡 整體解釋：{q.explanation}
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
} 
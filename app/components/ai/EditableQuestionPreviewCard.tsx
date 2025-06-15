import { Question, SingleChoiceQuestion, MultipleChoiceQuestion, FillInQuestion, ShortAnswerQuestion, ReadingQuestion } from '@/app/types/question';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Button } from '@/app/components/ui/button';
import { Checkbox } from '@/app/components/ui/checkbox';
import TagSelector from '@/app/components/TagSelector';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Label } from '@/app/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  availableTags: string[];
  onPrevious: () => void;
  onNext: () => void;
  onImport: (question: Question) => void;
  onSkip: () => void;
}

const QUESTION_TYPES = [
  { value: '單選題', label: '單選題' },
  { value: '多選題', label: '多選題' },
  { value: '填空題', label: '填空題' },
  { value: '簡答題', label: '簡答題' },
  { value: '閱讀測驗', label: '閱讀測驗' },
];

function sanitizeQuestion(raw: any): Question | null {
  try {
    const base = {
      id: raw.id || '',
      content: raw.content || '',
      explanation: raw.explanation || '',
      tags: Array.isArray(raw.tags) ? raw.tags : [],
      type: raw.type || '單選題',
      createdAt: raw.createdAt || new Date().toISOString(),
      updatedAt: raw.updatedAt || new Date().toISOString(),
    };

    switch (raw.type) {
      case '單選題':
        return {
          ...base,
          type: '單選題',
          options: Array.isArray(raw.options) && raw.options.length > 0 
            ? raw.options 
            : ['', '', '', ''],
          answer: typeof raw.answer === 'number' && raw.answer >= 0 && raw.answer < 4
            ? raw.answer
            : 0
        } as SingleChoiceQuestion;

      case '多選題':
        const options = Array.isArray(raw.options) && raw.options.length > 0
          ? raw.options
          : ['', '', '', ''];
        
        const answers = Array.isArray(raw.answers) 
          ? raw.answers.filter((i: number) => i >= 0 && i < options.length)
          : [];

        console.log('🔍 處理多選題:', {
          原始選項: raw.options,
          處理後選項: options,
          原始答案: raw.answers,
          處理後答案: answers
        });

        return {
          ...base,
          type: '多選題',
          options,
          answers
        } as MultipleChoiceQuestion;

      case '填空題':
        return {
          ...base,
          type: '填空題',
          blanks: Array.isArray(raw.blanks) ? raw.blanks : []
        } as FillInQuestion;

      case '簡答題':
        return {
          ...base,
          type: '簡答題',
          answer: raw.answer || ''
        } as ShortAnswerQuestion;

      case '閱讀測驗':
        return {
          ...base,
          type: '閱讀測驗',
          article: raw.article || '',
          questions: Array.isArray(raw.questions)
            ? raw.questions.map((q: any) => ({
                id: q.id || uuidv4(),
                content: q.content || '',
                options: Array.isArray(q.options) ? q.options : ['', '', '', ''],
                answer: typeof q.answer === 'string' ? q.answer : '',
                explanation: q.explanation || ''
              }))
            : []
        } as ReadingQuestion;

      default:
        return null;
    }
  } catch (error) {
    console.error('題目資料清洗錯誤:', error);
    return null;
  }
}

export function EditableQuestionPreviewCard({
  question: initialQuestion,
  currentIndex,
  totalQuestions,
  availableTags,
  onPrevious,
  onNext,
  onImport,
  onSkip,
}: Props) {
  const [editedQuestion, setEditedQuestion] = useState<Question>(sanitizeQuestion(initialQuestion) || initialQuestion);
  const [selectedTags, setSelectedTags] = useState<string[]>(editedQuestion.tags || []);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    const sanitized = sanitizeQuestion(initialQuestion);
    if (sanitized) {
      setEditedQuestion(sanitized);
      setSelectedTags(sanitized.tags || []);
    }
  }, [initialQuestion]);

  const handleTypeChange = (newType: string) => {
    const transformed = sanitizeQuestion({
      ...editedQuestion,
      type: newType,
      // 重置相關欄位
      options: newType === '單選題' || newType === '多選題' ? ['', '', '', ''] : undefined,
      answer: newType === '單選題' ? 0 : newType === '簡答題' ? '' : undefined,
      answers: newType === '多選題' ? [] : undefined,
      blanks: newType === '填空題' ? [] : undefined,
      article: newType === '閱讀測驗' ? '' : undefined,
      questions: newType === '閱讀測驗' ? [] : undefined,
    });
    if (transformed) {
      setEditedQuestion(transformed);
    }
  };

  // 驗證標籤數量
  const validateTags = () => {
    if (selectedTags.length === 0) {
      return '請至少選擇一個標籤';
    }
    if (selectedTags.length > 4) {
      return '最多只能選擇四個標籤';
    }
    return '';
  };

  const handleImportClick = () => {
    const tagError = validateTags();
    if (tagError) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }
    onImport({ ...editedQuestion, tags: selectedTags });
  };

  const renderSingleChoiceEditor = (q: SingleChoiceQuestion) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">題幹</label>
        <Textarea
          value={q.content}
          onChange={(e) => setEditedQuestion({ ...q, content: e.target.value } as SingleChoiceQuestion)}
          placeholder="請輸入題目內容..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">選項</label>
        <div className="space-y-2">
          {q.options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="w-6">{String.fromCharCode(65 + index)}</span>
              <Input
                value={option}
                onChange={(e) => {
                  const newOptions = [...q.options];
                  newOptions[index] = e.target.value;
                  setEditedQuestion({ ...q, options: newOptions } as SingleChoiceQuestion);
                }}
                placeholder={`選項 ${String.fromCharCode(65 + index)}`}
              />
            </div>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">正確答案</label>
        <Select
          value={q.answer.toString()}
          onValueChange={(value) => setEditedQuestion({ ...q, answer: parseInt(value) } as SingleChoiceQuestion)}
        >
          <SelectTrigger>
            <SelectValue placeholder="選擇正確答案" />
          </SelectTrigger>
          <SelectContent>
            {q.options.map((_, index) => (
              <SelectItem key={index} value={index.toString()}>
                {String.fromCharCode(65 + index)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderMultipleChoiceEditor = (q: MultipleChoiceQuestion) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">題幹</label>
        <Textarea
          value={q.content}
          onChange={(e) => setEditedQuestion({ ...q, content: e.target.value } as MultipleChoiceQuestion)}
          placeholder="請輸入題目內容..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">選項</label>
        <div className="space-y-2">
          {q.options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <Checkbox
                checked={q.answers.includes(index)}
                onCheckedChange={(checked) => {
                  const newAnswers = checked
                    ? [...q.answers, index].sort()
                    : q.answers.filter(a => a !== index);
                  setEditedQuestion({ ...q, answers: newAnswers } as MultipleChoiceQuestion);
                }}
              />
              <span className="w-6">{String.fromCharCode(65 + index)}</span>
              <Input
                value={option}
                onChange={(e) => {
                  const newOptions = [...q.options];
                  newOptions[index] = e.target.value;
                  setEditedQuestion({ ...q, options: newOptions } as MultipleChoiceQuestion);
                }}
                placeholder={`選項 ${String.fromCharCode(65 + index)}`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFillInBlankEditor = (q: FillInQuestion) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">題幹（使用 [[答案]] 標記填空處）</label>
        <Textarea
          value={q.content}
          onChange={(e) => {
            const content = e.target.value;
            const blanks = (content.match(/\[\[(.*?)\]\]/g) || [])
              .map(match => match.slice(2, -2));
            setEditedQuestion({ ...q, content, blanks });
          }}
          placeholder="請輸入題目內容，使用 [[答案]] 標記填空處..."
          rows={5}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">填空答案</label>
        <div className="text-sm text-gray-500">
          {q.blanks.length > 0 
            ? q.blanks.map((blank, i) => `${i + 1}. ${blank}`).join('、')
            : '尚未標記任何填空'}
        </div>
      </div>
    </div>
  );

  const renderShortAnswerEditor = (q: ShortAnswerQuestion) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">題幹</label>
        <Textarea
          value={q.content}
          onChange={(e) => setEditedQuestion({ ...q, content: e.target.value } as ShortAnswerQuestion)}
          placeholder="請輸入題目內容..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">答案</label>
        <Textarea
          value={q.answer}
          onChange={(e) => setEditedQuestion({ ...q, answer: e.target.value } as ShortAnswerQuestion)}
          placeholder="請輸入參考答案..."
        />
      </div>
    </div>
  );

  const renderReadingTestEditor = (q: ReadingQuestion) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">文章內容</label>
        <Textarea
          value={q.article}
          onChange={(e) => setEditedQuestion({ ...q, article: e.target.value } as ReadingQuestion)}
          placeholder="請輸入文章內容..."
          rows={5}
          className="bg-white dark:bg-gray-50 text-gray-900 dark:text-gray-900 border-gray-200 dark:border-gray-300"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">子題目</label>
        <div className="space-y-4">
          {q.questions.map((subQ, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 space-y-4">
              <div>
                <Label className="text-gray-700 dark:text-mainBg">題目 {index + 1}</Label>
                <Textarea
                  value={subQ.content}
                  onChange={(e) => {
                    const newQuestions = [...q.questions];
                    newQuestions[index] = { ...subQ, content: e.target.value };
                    setEditedQuestion({
                      ...q,
                      questions: newQuestions
                    } as ReadingQuestion);
                  }}
                  className="mt-2 bg-white dark:bg-gray-50 text-gray-900 dark:text-gray-900 border-gray-200 dark:border-gray-300"
                />
              </div>
              <div className="space-y-2">
                {subQ.options.map((option, optIndex) => (
                  <div key={optIndex} className="flex items-center gap-2">
                    <RadioGroup
                      value={subQ.answer}
                      onValueChange={(value) => {
                        const newQuestions = [...q.questions];
                        newQuestions[index] = { ...subQ, answer: value };
                        setEditedQuestion({
                          ...q,
                          questions: newQuestions
                        } as ReadingQuestion);
                      }}
                    >
                      <RadioGroupItem value={option} />
                    </RadioGroup>
                    <Input
                      value={option}
                      onChange={(e) => {
                        const newQuestions = [...q.questions];
                        const newOptions = [...subQ.options];
                        newOptions[optIndex] = e.target.value;
                        newQuestions[index] = { ...subQ, options: newOptions };
                        setEditedQuestion({
                          ...q,
                          questions: newQuestions
                        } as ReadingQuestion);
                      }}
                      className="flex-1 bg-white dark:bg-gray-50 text-gray-900 dark:text-gray-900 border-gray-200 dark:border-gray-300"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-2">
                <Select
                  value={subQ.answer}
                  onValueChange={(value) => {
                    const newQuestions = [...q.questions];
                    newQuestions[index] = { ...subQ, answer: value };
                    setEditedQuestion({ ...q, questions: newQuestions } as ReadingQuestion);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選擇正確答案" />
                  </SelectTrigger>
                  <SelectContent>
                    {subQ.options.map((_, optIndex) => (
                      <SelectItem key={optIndex} value={String.fromCharCode(65 + optIndex)}>
                        {String.fromCharCode(65 + optIndex)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderEditorByType = () => {
    switch (editedQuestion.type) {
      case '單選題':
        return renderSingleChoiceEditor(editedQuestion as SingleChoiceQuestion);
      case '多選題':
        return renderMultipleChoiceEditor(editedQuestion as MultipleChoiceQuestion);
      case '填空題':
        return renderFillInBlankEditor(editedQuestion as FillInQuestion);
      case '簡答題':
        return renderShortAnswerEditor(editedQuestion as ShortAnswerQuestion);
      case '閱讀測驗':
        return renderReadingTestEditor(editedQuestion as ReadingQuestion);
      default:
        return <div className="text-red-500">⚠️ 無法辨識的題型</div>;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center py-1 mb-1 flex-shrink-0 dark:border-gray-300">
        <h3 className="font-medium mb-2 text-gray-800 dark:text-mainBg">預覽與編輯</h3>
        <div className="flex items-center space-x-4">
          <Select value={editedQuestion.type} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-[140px] h-8 bg-mainBg dark:bg-default text-gray-700 dark:text-mainBg border-gray-200 dark:border-gray-300">
              <SelectValue placeholder="選擇題型" />
            </SelectTrigger>
            <SelectContent className="bg-mainBg dark:bg-default text-gray-700 dark:text-mainBg border-gray-200 dark:border-gray-300">
              {QUESTION_TYPES.map(type => (
                <SelectItem 
                  key={type.value} 
                  value={type.value}
                  className="text-gray-700 dark:text-mainBg hover:bg-gray-100 dark:hover:bg-gray-400"
                >
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <span>第 {currentIndex + 1} 題，共 {totalQuestions} 題</span>
          </div>
        </div>
      </div>

      <Card className="flex-1 bg-mainBg dark:bg-default border border-gray-300 dark:border-gray-600 overflow-hidden">
        <CardContent className="h-full lg:h-[calc(90vh-12rem)] overflow-y-auto p-6">
          <div className="space-y-6">
            {editedQuestion.type === '閱讀測驗' ? (
              <div className="space-y-4">
                <Textarea
                  value={editedQuestion.article}
                  onChange={(e) => setEditedQuestion({ ...editedQuestion, article: e.target.value } as ReadingQuestion)}
                  placeholder="請輸入文章內容..."
                  rows={5}
                  className="bg-white dark:bg-gray-50 text-gray-900 dark:text-gray-900 border-gray-200 dark:border-gray-300"
                />
                <div>
                  <label className="block text-sm font-medium mb-2">子題目</label>
                  <div className="space-y-4">
                    {(editedQuestion as ReadingQuestion).questions.map((subQ, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 space-y-4">
                        <div>
                          <Label className="text-gray-700 dark:text-mainBg">題目 {index + 1}</Label>
                          <Textarea
                            value={subQ.content}
                            onChange={(e) => {
                              const newQuestions = [...(editedQuestion as ReadingQuestion).questions];
                              newQuestions[index] = { ...subQ, content: e.target.value };
                              setEditedQuestion({
                                ...editedQuestion,
                                questions: newQuestions
                              } as ReadingQuestion);
                            }}
                            className="mt-2 bg-white dark:bg-gray-50 text-gray-900 dark:text-gray-900 border-gray-200 dark:border-gray-300"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-700 dark:text-mainBg">選項</Label>
                          <div className="space-y-2 mt-2">
                            {subQ.options.map((option, optIndex) => (
                              <div key={optIndex} className="flex items-center gap-2">
                                <RadioGroup
                                  value={subQ.answer}
                                  onValueChange={(value) => {
                                    const newQuestions = [...(editedQuestion as ReadingQuestion).questions];
                                    newQuestions[index] = { ...subQ, answer: value };
                                    setEditedQuestion({
                                      ...editedQuestion,
                                      questions: newQuestions
                                    } as ReadingQuestion);
                                  }}
                                >
                                  <RadioGroupItem value={option} />
                                </RadioGroup>
                                <Input
                                  value={option}
                                  onChange={(e) => {
                                    const newQuestions = [...(editedQuestion as ReadingQuestion).questions];
                                    const newOptions = [...subQ.options];
                                    newOptions[optIndex] = e.target.value;
                                    newQuestions[index] = { ...subQ, options: newOptions };
                                    setEditedQuestion({
                                      ...editedQuestion,
                                      questions: newQuestions
                                    } as ReadingQuestion);
                                  }}
                                  className="flex-1 bg-white dark:bg-gray-50 text-gray-900 dark:text-gray-900 border-gray-200 dark:border-gray-300"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label className="text-gray-700 dark:text-mainBg">解釋</Label>
                          <Textarea
                            value={subQ.explanation}
                            onChange={(e) => {
                              const newQuestions = [...(editedQuestion as ReadingQuestion).questions];
                              newQuestions[index] = { ...subQ, explanation: e.target.value };
                              setEditedQuestion({
                                ...editedQuestion,
                                questions: newQuestions
                              } as ReadingQuestion);
                            }}
                            className="mt-2 bg-white dark:bg-gray-50 text-gray-900 dark:text-gray-900 border-gray-200 dark:border-gray-300"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Textarea
                value={editedQuestion.content}
                onChange={(e) => setEditedQuestion({ ...editedQuestion, content: e.target.value })}
                className="bg-white dark:bg-gray-50 text-gray-900 dark:text-gray-900 border-gray-200 dark:border-gray-300"
                placeholder="請輸入題目內容..."
              />
            )}

            {editedQuestion.type === '單選題' && (
              <div>
                <Label className="text-gray-700 dark:text-mainBg">選項</Label>
                <RadioGroup
                  value={String((editedQuestion as SingleChoiceQuestion).answer)}
                  onValueChange={(value) =>
                    setEditedQuestion({
                      ...editedQuestion,
                      answer: parseInt(value)
                    } as SingleChoiceQuestion)
                  }
                  className="mt-2 space-y-2"
                >
                  {(editedQuestion as SingleChoiceQuestion).options.map((option: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={String(index)} id={`option-${index}`} />
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...(editedQuestion as SingleChoiceQuestion).options];
                          newOptions[index] = e.target.value;
                          setEditedQuestion({
                            ...editedQuestion,
                            options: newOptions
                          } as SingleChoiceQuestion);
                        }}
                        className="flex-1 bg-white dark:bg-gray-50 text-gray-900 dark:text-gray-900 border-gray-200 dark:border-gray-300"
                      />
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {editedQuestion.type === '多選題' && (
              <div>
                <Label className="text-gray-700 dark:text-mainBg">選項</Label>
                <div className="mt-2 space-y-2">
                  {(editedQuestion as MultipleChoiceQuestion).options.map((option: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Checkbox
                        checked={(editedQuestion as MultipleChoiceQuestion).answers.includes(index)}
                        onCheckedChange={(checked) => {
                          const newAnswers = checked
                            ? [...(editedQuestion as MultipleChoiceQuestion).answers, index].sort()
                            : (editedQuestion as MultipleChoiceQuestion).answers.filter(a => a !== index);
                          setEditedQuestion({
                            ...editedQuestion,
                            answers: newAnswers
                          } as MultipleChoiceQuestion);
                        }}
                      />
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...(editedQuestion as MultipleChoiceQuestion).options];
                          newOptions[index] = e.target.value;
                          setEditedQuestion({
                            ...editedQuestion,
                            options: newOptions
                          } as MultipleChoiceQuestion);
                        }}
                        className="flex-1 bg-white dark:bg-gray-50 text-gray-900 dark:text-gray-900 border-gray-200 dark:border-gray-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {editedQuestion.type === '填空題' && (
              <div>
                <Label className="text-gray-700 dark:text-mainBg">答案</Label>
                <div className="mt-2 space-y-2">
                  {(editedQuestion as FillInQuestion).blanks.map((blank: string, index: number) => (
                    <Input
                      key={index}
                      value={blank}
                      onChange={(e) => {
                        const newBlanks = [...(editedQuestion as FillInQuestion).blanks];
                        newBlanks[index] = e.target.value;
                        setEditedQuestion({
                          ...editedQuestion,
                          blanks: newBlanks
                        } as FillInQuestion);
                      }}
                      className="bg-white dark:bg-gray-50 text-gray-900 dark:text-gray-900 border-gray-200 dark:border-gray-300"
                    />
                  ))}
                </div>
              </div>
            )}

            {editedQuestion.type === '簡答題' && (
              <div>
                <Label className="text-gray-700 dark:text-mainBg">答案</Label>
                <Textarea
                  value={(editedQuestion as ShortAnswerQuestion).answer}
                  onChange={(e) =>
                    setEditedQuestion({
                      ...editedQuestion,
                      answer: e.target.value
                    } as ShortAnswerQuestion)
                  }
                  className="mt-2 bg-white dark:bg-gray-50 text-gray-900 dark:text-gray-900 border-gray-200 dark:border-gray-300"
                />
              </div>
            )}

            <div>
              <Label className="text-gray-700 dark:text-mainBg">解析</Label>
              <Textarea
                value={editedQuestion.explanation}
                onChange={(e) =>
                  setEditedQuestion({
                    ...editedQuestion,
                    explanation: e.target.value
                  })
                }
                className="mt-2 bg-white dark:bg-gray-50 text-gray-900 dark:text-gray-900 border-gray-200 dark:border-gray-300"
              />
            </div>

            <div>
              <Label className="text-gray-700 dark:text-mainBg">標籤</Label>
              <div className="mt-2">
                <TagSelector
                  value={selectedTags}
                  onChange={setSelectedTags}
                  allTags={availableTags}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center mt-4 space-x-2 flex-shrink-0">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={currentIndex === 0}
            className="bg-mainBg dark:bg-white text-gray-700 dark:text-gray-800 border-gray-200 dark:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-100"
          >
            ←
          </Button>
          <Button
            variant="outline"
            onClick={onNext}
            disabled={currentIndex === totalQuestions - 1}
            className="bg-mainBg dark:bg-white text-gray-700 dark:text-gray-800 border-gray-200 dark:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-100"
          >
            →
          </Button>
        </div>
        <div className="flex items-center space-x-4">
          {showError && validateTags() && (
            <span className="text-red-500 animate-fadeIn text-sm">
              ⚠️ {validateTags()}
            </span>
          )}
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              const tagError = validateTags();
              if (tagError) {
                setShowError(true);
                setTimeout(() => setShowError(false), 3000);
                return;
              }
              handleImportClick();
            }}
            className={`bg-primary hover:bg-primary/90 text-white transition ${validateTags() ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            💾儲存
          </Button>
        </div>
      </div>
    </div>
  );
} 